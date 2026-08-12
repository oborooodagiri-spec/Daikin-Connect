/**
 * Uninstall Daikin Modbus Agent Windows Service
 */
const Service = require("node-windows").Service;
const path = require("path");

const svc = new Service({
  name: "DaikinModbusAgent",
  script: path.join(__dirname, "agent.js"),
});

svc.on("uninstall", () => {
  console.log("");
  console.log("========================================");
  console.log("  Daikin Modbus Agent - SERVICE REMOVED");
  console.log("========================================");
  console.log("  The service has been uninstalled.");
  console.log("  It will no longer start on boot.");
  console.log("========================================");
});

svc.uninstall();
