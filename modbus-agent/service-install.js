/**
 * Install Daikin Modbus Agent as a Windows Service
 */
const Service = require("node-windows").Service;
const path = require("path");

const svc = new Service({
  name: "DaikinModbusAgent",
  description: "Daikin Connect - Local Modbus TCP Data Collector",
  script: path.join(__dirname, "agent.js"),
  nodeOptions: [],
  env: [{ name: "NODE_ENV", value: "production" }],
});

svc.on("install", () => {
  console.log("");
  console.log("========================================");
  console.log("  Daikin Modbus Agent - SERVICE INSTALLED");
  console.log("========================================");
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
  console.log("========================================");
});

svc.on("alreadyinstalled", () => {
  console.log("Service is already installed. Starting...");
  svc.start();
});

svc.on("error", (err) => {
  console.error("Error:", err);
});

svc.install();
