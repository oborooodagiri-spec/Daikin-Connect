/**
 * Daikin Connect — Local Modbus TCP Agent
 * ========================================
 * Script ini berjalan di komputer lokal yang terhubung ke jaringan Modbus.
 * Tugasnya: membaca register Modbus setiap X detik, lalu mengirim ke server VPS.
 * 
 * Konfigurasi ada di file config.json
 */

const ModbusRTU = require("modbus-serial");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Load config
const CONFIG_PATH = path.join(__dirname, "config.json");
let config;

try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
} catch (err) {
  console.error("[FATAL] Cannot read config.json:", err.message);
  process.exit(1);
}

const {
  server_url,
  api_key,
  gateway_ip,
  gateway_port = 502,
  slave_id = 1,
  poll_interval_seconds = 60,
} = config;

// Validate config
if (!server_url || server_url === "https://daikin.oborooodagiri.com") {
  console.warn("[WARN] server_url belum dikonfigurasi di config.json");
}
if (!api_key || api_key === "PASTE_API_KEY_FROM_ADMIN_PANEL_HERE") {
  console.error("[FATAL] api_key belum diisi di config.json! Buat gateway di admin panel dulu.");
  process.exit(1);
}

const client = new ModbusRTU();
let isConnected = false;
let reconnectTimer = null;
let pollTimer = null;

// ─── Logging ───────────────────────────────────────────────
const LOG_DIR = path.join(__dirname, "logs");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  console.log(line);

  const logFile = path.join(LOG_DIR, `agent-${new Date().toISOString().slice(0, 10)}.log`);
  fs.appendFileSync(logFile, line + "\n");
}

// ─── Fetch register list from server ───────────────────────
async function fetchRegisters() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${server_url}/api/v1/modbus/registers`);
    // We need gateway_id - fetch it from gateways endpoint first
    const gwUrl = new URL(`${server_url}/api/v1/modbus/gateways`);
    const protocol = gwUrl.protocol === "https:" ? https : http;
    
    const reqOptions = {
      hostname: gwUrl.hostname,
      port: gwUrl.port || (gwUrl.protocol === "https:" ? 443 : 80),
      path: gwUrl.pathname,
      method: "GET",
      headers: { "x-api-key": api_key },
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const gateways = json.gateways || [];
          const myGateway = gateways.find((g) => g.api_key === api_key);
          if (!myGateway) {
            reject(new Error("Gateway not found for this API key"));
            return;
          }
          resolve({
            gateway_id: myGateway.id,
            registers: myGateway.registers || [],
            poll_interval: myGateway.poll_interval || poll_interval_seconds,
          });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

// ─── Modbus Connection ─────────────────────────────────────
async function connectModbus() {
  try {
    log("INFO", `Connecting to Modbus TCP ${gateway_ip}:${gateway_port}...`);
    await client.connectTCP(gateway_ip, { port: gateway_port });
    client.setID(slave_id);
    client.setTimeout(5000);
    isConnected = true;
    log("INFO", `Connected to Modbus TCP ${gateway_ip}:${gateway_port} (Slave ID: ${slave_id})`);
  } catch (err) {
    isConnected = false;
    log("ERROR", `Modbus connection failed: ${err.message}`);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  log("INFO", "Reconnecting in 10 seconds...");
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await connectModbus();
  }, 10000);
}

// ─── Read Registers ────────────────────────────────────────
async function readRegister(register) {
  const { register_address, register_type, data_type } = register;

  try {
    let result;
    const addr = register_address;

    if (register_type === "input") {
      result = await client.readInputRegisters(addr, data_type === "INT32" || data_type === "FLOAT32" ? 2 : 1);
    } else {
      result = await client.readHoldingRegisters(addr, data_type === "INT32" || data_type === "FLOAT32" ? 2 : 1);
    }

    let rawValue = result.data[0];

    // Handle multi-register data types
    if (data_type === "INT32" || data_type === "FLOAT32") {
      rawValue = (result.data[0] << 16) | result.data[1];
    }

    // Handle signed INT16
    if (data_type === "INT16" && rawValue > 32767) {
      rawValue = rawValue - 65536;
    }

    return rawValue;
  } catch (err) {
    log("WARN", `Failed to read register ${register_address} (${register.name}): ${err.message}`);
    return null;
  }
}

// ─── Send data to server ──────────────────────────────────
function sendToServer(readings) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${server_url}/api/v1/modbus/ingest`);
    const protocol = url.protocol === "https:" ? https : http;
    const payload = JSON.stringify({ readings });

    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(json);
          } else {
            reject(new Error(`Server responded ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ─── Main Poll Cycle ───────────────────────────────────────
async function pollCycle(registers) {
  if (!isConnected) {
    log("WARN", "Modbus not connected, skipping poll cycle");
    return;
  }

  log("INFO", `Starting poll cycle — reading ${registers.length} registers...`);
  const readings = [];

  for (const reg of registers) {
    if (!reg.is_active) continue;

    const rawValue = await readRegister(reg);
    if (rawValue !== null) {
      readings.push({
        register_address: reg.register_address,
        raw_value: rawValue,
      });
    }

    // Small delay between reads to not overwhelm the Modbus device
    await new Promise((r) => setTimeout(r, 50));
  }

  if (readings.length === 0) {
    log("WARN", "No readings collected this cycle");
    return;
  }

  log("INFO", `Collected ${readings.length} readings, sending to server...`);

  try {
    const result = await sendToServer(readings);
    log("INFO", `Server accepted: ${result.readings_stored}/${result.readings_received} stored`);
  } catch (err) {
    log("ERROR", `Failed to send data to server: ${err.message}`);
    // Save locally as backup
    const backupFile = path.join(LOG_DIR, `backup-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify({ readings, timestamp: new Date().toISOString() }));
    log("INFO", `Backup saved to ${backupFile}`);
  }
}

// ─── Main Entry ────────────────────────────────────────────
async function main() {
  log("INFO", "╔══════════════════════════════════════════════╗");
  log("INFO", "║    Daikin Connect — Modbus TCP Agent v1.0    ║");
  log("INFO", "╚══════════════════════════════════════════════╝");
  log("INFO", `Gateway IP   : ${gateway_ip}:${gateway_port}`);
  log("INFO", `Slave ID     : ${slave_id}`);
  log("INFO", `Server       : ${server_url}`);
  log("INFO", `Poll Interval: ${poll_interval_seconds}s`);
  log("INFO", "");

  // 1. Fetch register configuration from server
  let gatewayInfo;
  try {
    gatewayInfo = await fetchRegisters();
    log("INFO", `Loaded ${gatewayInfo.registers.length} registers from server (Gateway #${gatewayInfo.gateway_id})`);
  } catch (err) {
    log("ERROR", `Failed to fetch registers from server: ${err.message}`);
    log("INFO", "Using local config registers (if any)...");
    gatewayInfo = {
      registers: config.registers || [],
      poll_interval: poll_interval_seconds,
    };
  }

  if (gatewayInfo.registers.length === 0) {
    log("WARN", "No registers configured! Add registers via admin panel, then restart agent.");
    log("INFO", "Agent will keep running and check for registers every 60 seconds...");
    
    setInterval(async () => {
      try {
        gatewayInfo = await fetchRegisters();
        if (gatewayInfo.registers.length > 0) {
          log("INFO", `Found ${gatewayInfo.registers.length} registers! Starting polling...`);
          await connectModbus();
          startPolling(gatewayInfo);
        }
      } catch (e) {
        // silent retry
      }
    }, 60000);
    return;
  }

  // 2. Connect to Modbus
  await connectModbus();

  // 3. Start polling
  startPolling(gatewayInfo);

  // Handle disconnection
  client.on("close", () => {
    isConnected = false;
    log("WARN", "Modbus connection closed");
    scheduleReconnect();
  });
}

function startPolling(gatewayInfo) {
  const interval = (gatewayInfo.poll_interval || poll_interval_seconds) * 1000;
  
  // Initial poll
  pollCycle(gatewayInfo.registers);

  // Schedule recurring polls
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    pollCycle(gatewayInfo.registers);
  }, interval);

  log("INFO", `Polling started — every ${interval / 1000} seconds`);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  log("INFO", "Agent shutting down...");
  if (pollTimer) clearInterval(pollTimer);
  client.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  log("INFO", "Agent shutting down (SIGTERM)...");
  if (pollTimer) clearInterval(pollTimer);
  client.close(() => process.exit(0));
});

// Start
main().catch((err) => {
  log("FATAL", `Unhandled error: ${err.message}`);
  process.exit(1);
});
