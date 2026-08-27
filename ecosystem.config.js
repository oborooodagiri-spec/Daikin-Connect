module.exports = {
  apps: [
    {
      name: "daikin-connect",
      script: "npm",
      args: "start",
      cwd: "/root/Daikin-Connect",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
