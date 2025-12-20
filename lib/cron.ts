import cron from "cron";
import http from "http";
import https from "https";
import "dotenv/config";

const runtimeEnv = process.env.RUNTIME_ENV || "production";

const job = runtimeEnv === "development" ? new cron.CronJob("*/14 * * * *", function () {
  http
    .get(process.env.DEV_API_URL!, (res) => {
      if (res.statusCode === 200) console.log("Development ","GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
}) : new cron.CronJob("*/14 * * * *", function () {
  https
    .get(process.env.PROD_API_URL!, (res) => {
      if (res.statusCode === 200) console.log("Production ","GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

export default job;