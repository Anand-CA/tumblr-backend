const Redis = require("ioredis");
const client = new Redis();

client.on("connect", () => {
  console.log("Connected To Redis");
});

client.on("ready", () => {
  console.log("Ready");
});

client.on("error", (err) => {
  console.log(err.message);
});

client.on("end", () => {
  console.log("Disconnected From Redis");
});

process.on("SIGINT", () => {
  client.quit();
});

module.exports = client;
