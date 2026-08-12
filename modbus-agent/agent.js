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

// ─── Global error handlers (prevent crash) ─────────────────
process.on("uncaughtException", (err) => {
  try {
    log("FATAL", `Uncaught Exception: ${err.message}\n${err.stack}`);
  } catch (_) {
    console.error("[FATAL] Uncaught Exception:", err);
  }
  // Don't exit — let the service manager handle restart
});

process.on("unhandledRejection", (reason) => {
  try {
    log("ERROR", `Unhandled Rejection: ${reason}`);
  } catch (_) {
    console.error("[ERROR] Unhandled Rejection:", reason);
  }
});

// ─── Load config ───────────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, "config.json");
let config;

try {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  config = JSON.parse(raw);
} catch (err) {
  console.error("[FATAL] Cannot read config.json:", err.message);
  console.error("Make sure config.json exists in:", __dirname);
  process.exit(1);
}

const server_url = config.server_url || "";
const api_key = config.api_key || "";
const gateway_ip = config.gateway_ip || "172.18.35.10";
const gateway_port = config.gateway_port || 502;
const slave_id = config.slave_id || 1;
const poll_interval_seconds = config.poll_interval_seconds || 60;

// Validate config
if (!server_url) {
  console.error("[FATAL] server_url belum dikonfigurasi di config.json!");
  process.exit(1);
}
if (!api_key || api_key === "PASTE_API_KEY_FROM_ADMIN_PANEL_HERE") {
  console.error("[FATAL] api_key belum diisi di config.json! Buat gateway di admin panel dulu.");
  process.exit(1);
}
if (!gateway_ip) {
  console.error("[FATAL] gateway_ip belum diisi di config.json!");
  process.exit(1);
}

let client = new ModbusRTU();
let isConnected = false;
let isPolling = false;
let reconnectTimer = null;
let pollTimer = null;

// ─── Logging ───────────────────────────────────────────────
const LOG_DIR = path.join(__dirname, "logs");
try {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
} catch (e) {
  console.error("Cannot create logs directory:", e.message);
}

function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  console.log(line);

  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const logFile = path.join(LOG_DIR, `agent-${dateStr}.log`);
    fs.appendFileSync(logFile, line + "\n");
  } catch (_) {
    // Silent fail for log writing — never crash because of logging
  }

  // Cleanup: delete log files older than 30 days
  try {
    const files = fs.readdirSync(LOG_DIR);
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const file of files) {
      if (!file.startsWith("agent-")) continue;
      const filePath = path.join(LOG_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (_) {
    // Silent fail
  }
}

// ─── Fetch register list from server ───────────────────────
function fetchRegisters() {
  return new Promise((resolve, reject) => {
    try {
      const gwUrl = new URL(`${server_url}/api/v1/modbus/gateways`);
      const protocol = gwUrl.protocol === "https:" ? https : http;
      
      const reqOptions = {
        hostname: gwUrl.hostname,
        port: gwUrl.port || (gwUrl.protocol === "https:" ? 443 : 80),
        path: gwUrl.pathname,
        method: "GET",
        headers: { "x-api-key": api_key },
        timeout: 15000,
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
            reject(new Error("Invalid JSON response from server: " + e.message));
          }
        });
      });

      req.on("error", (e) => reject(new Error("Network error: " + e.message)));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout (15s)"));
      });
      req.end();
    } catch (e) {
      reject(new Error("Failed to create request: " + e.message));
    }
  });
}

// ─── Modbus Connection ─────────────────────────────────────
async function connectModbus() {
  try {
    // Close existing connection if any
    try {
      if (client && client.isOpen) {
        client.close(() => {});
      }
    } catch (_) {}

    // Create fresh client instance to avoid stale socket state
    client = new ModbusRTU();

    log("INFO", `Connecting to Modbus TCP ${gateway_ip}:${gateway_port}...`);
    await client.connectTCP(gateway_ip, { port: gateway_port });
    client.setID(slave_id);
    client.setTimeout(5000);
    isConnected = true;
    log("INFO", `Connected to Modbus TCP ${gateway_ip}:${gateway_port} (Slave ID: ${slave_id})`);
    return true;
  } catch (err) {
    isConnected = false;
    log("ERROR", `Modbus connection failed: ${err.message}`);
    scheduleReconnect();
    return false;
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  log("INFO", "Reconnecting in 15 seconds...");
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await connectModbus();
    } catch (e) {
      log("ERROR", `Reconnect failed: ${e.message}`);
      scheduleReconnect();
    }
  }, 15000);
}

// ─── Read Registers ────────────────────────────────────────
async function readRegister(register) {
  if (!isConnected || !client || !client.isOpen) {
    return null;
  }

  const { register_address, register_type, data_type } = register;

  try {
    let result;
    const addr = register_address;
    const count = (data_type === "INT32" || data_type === "FLOAT32") ? 2 : 1;

    if (register_type === "input") {
      result = await client.readInputRegisters(addr, count);
    } else {
      result = await client.readHoldingRegisters(addr, count);
    }

    if (!result || !result.data || result.data.length === 0) {
      log("WARN", `Empty result for register ${register_address} (${register.name})`);
      return null;
    }

    let rawValue = result.data[0];

    // Handle multi-register data types
    if ((data_type === "INT32" || data_type === "FLOAT32") && result.data.length >= 2) {
      rawValue = (result.data[0] << 16) | result.data[1];
    }

    // Handle signed INT16
    if (data_type === "INT16" && rawValue > 32767) {
      rawValue = rawValue - 65536;
    }

    return rawValue;
  } catch (err) {
    log("WARN", `Failed to read register ${register_address} (${register.name || "?"}): ${err.message}`);
    
    // If we get a connection-related error, mark as disconnected
    if (err.message.includes("Port Not Open") || err.message.includes("ECONNRESET") || err.message.includes("ETIMEDOUT")) {
      isConnected = false;
      scheduleReconnect();
    }
    return null;
  }
}

// ─── Send data to server ──────────────────────────────────
function sendToServer(readings) {
  return new Promise((resolve, reject) => {
    try {
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
        timeout: 30000,
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
            reject(new Error("Invalid JSON from server: " + e.message));
          }
        });
      });

      req.on("error", (e) => reject(new Error("Network error: " + e.message)));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout (30s)"));
      });
      req.write(payload);
      req.end();
    } catch (e) {
      reject(new Error("Failed to create request: " + e.message));
    }
  });
}

// ─── Main Poll Cycle ───────────────────────────────────────
async function pollCycle(registers) {
  // Prevent overlapping polls
  if (isPolling) {
    log("WARN", "Previous poll still running, skipping this cycle");
    return;
  }

  if (!isConnected) {
    log("WARN", "Modbus not connected, skipping poll cycle");
    scheduleReconnect();
    return;
  }

  isPolling = true;

  try {
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
      await new Promise((r) => setTimeout(r, 100));
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
      try {
        const backupFile = path.join(LOG_DIR, `backup-${Date.now()}.json`);
        fs.writeFileSync(backupFile, JSON.stringify({ readings, timestamp: new Date().toISOString() }));
        log("INFO", `Backup saved to ${backupFile}`);
      } catch (e) {
        log("ERROR", `Failed to save backup: ${e.message}`);
      }
    }
  } catch (err) {
    log("ERROR", `Poll cycle error: ${err.message}`);
  } finally {
    isPolling = false;
  }
}

// ─── Main Entry ────────────────────────────────────────────
async function main() {
  log("INFO", "========================================");
  log("INFO", "  Daikin Connect - Modbus TCP Agent v1.0");
  log("INFO", "========================================");
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
    log("WARN", "No registers configured! Add registers via admin panel.");
    log("INFO", "Agent will keep checking every 60 seconds...");
    
    const checkInterval = setInterval(async () => {
      try {
        const info = await fetchRegisters();
        if (info.registers.length > 0) {
          clearInterval(checkInterval);
          log("INFO", `Found ${info.registers.length} registers! Starting polling...`);
          const connected = await connectModbus();
          if (connected) {
            startPolling(info);
          }
        } else {
          log("INFO", "Still no registers configured, waiting...");
        }
      } catch (e) {
        log("WARN", `Register check failed: ${e.message}`);
      }
    }, 60000);
    return;
  }

  // 2. Connect to Modbus
  await connectModbus();

  // 3. Start polling
  startPolling(gatewayInfo);
}

function startPolling(gatewayInfo) {
  const interval = (gatewayInfo.poll_interval || poll_interval_seconds) * 1000;
  
  // Clear any existing poll timer
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  // Initial poll after a short delay (let connection stabilize)
  setTimeout(() => {
    pollCycle(gatewayInfo.registers);
  }, 2000);

  // Schedule recurring polls
  pollTimer = setInterval(() => {
    pollCycle(gatewayInfo.registers);
  }, interval);

  log("INFO", `Polling started — every ${interval / 1000} seconds`);
}

// Handle graceful shutdown
function shutdown(signal) {
  log("INFO", `Agent shutting down (${signal})...`);
  if (pollTimer) clearInterval(pollTimer);
  try {
    if (client && client.isOpen) {
      client.close(() => {
        log("INFO", "Modbus connection closed. Goodbye.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (_) {
    process.exit(0);
  }
  // Force exit after 5 seconds if graceful shutdown hangs
  setTimeout(() => process.exit(0), 5000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Start
main().catch((err) => {
  try {
    log("FATAL", `Startup error: ${err.message}\n${err.stack}`);
  } catch (_) {
    console.error("[FATAL]", err);
  }
});
