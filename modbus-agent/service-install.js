/**
 * Install Daikin Modbus Agent as a Windows Service
 */
const path = require("path");

let Service;
try {
  Service = require("node-windows").Service;
} catch (err) {
  console.error("");
  console.error("  [ERROR] Package 'node-windows' belum terinstall!");
  console.error("  Jalankan: npm install --production");
  console.error("");
  process.exit(1);
}

const svc = new Service({
  name: "DaikinModbusAgent",
  description: "Daikin Connect - Local Modbus TCP Data Collector",
  script: path.join(__dirname, "agent.js"),
  nodeOptions: [],
  env: [{ name: "NODE_ENV", value: "production" }],
  // Auto-restart on crash with increasing delay
  wait: 2,
  grow: 0.5,
  maxRestarts: 999,
});

svc.on("install", () => {
  console.log("");
  console.log("  ========================================");
  console.log("  Daikin Modbus Agent - SERVICE INSTALLED");
  console.log("  ========================================");
  console.log("");
  console.log("  Starting service...");
  svc.start();
});

svc.on("start", () => {
  console.log("  Service STARTED successfully!");
  console.log("");
  console.log("  The agent is now running in the background.");
  console.log("  It will automatically start when this computer boots.");
  console.log("");
  console.log("  To check status: Open 'Services' (services.msc)");
  console.log("  Look for: DaikinModbusAgent");
  console.log("");
  console.log("  Log files: " + path.join(__dirname, "logs"));
  console.log("  ========================================");
});

svc.on("alreadyinstalled", () => {
  console.log("  Service already installed. Restarting...");
  svc.stop();
  setTimeout(() => {
    svc.start();
  }, 2000);
});

svc.on("error", (err) => {
  console.error("  [ERROR] Service error:", err);
  console.error("");
  console.error("  Anda masih bisa menjalankan agent secara manual:");
  console.error("    cd " + __dirname);
  console.error("    node agent.js");
  console.error("");
});

try {
  svc.install();
} catch (err) {
  console.error("  [ERROR] Failed to install service:", err.message);
  console.error("");
  console.error("  Pastikan script dijalankan sebagai Administrator.");
  console.error("  Atau jalankan agent secara manual: node agent.js");
  console.error("");
  process.exit(1);
}
