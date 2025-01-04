import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import ReactApp from "../src/App";
import cron from "node-cron";
import fs from "fs";
import { corsMiddleware } from "./middlewares";
import { cacheFile, fetchAndCacheData } from "./utils";
import { routes } from "./routes";

const app = express();

// Middlewares
app.use([corsMiddleware]);

app.use([routes]);
app.use("/static", express.static("dist"));

app.get("*", (_req, res) => {
  const stream = renderToPipeableStream(<ReactApp />, {
    onShellReady() {
      res.status(200).setHeader("Content-Type", "text/html");
      stream.pipe(res);
    },
    onError(err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    },
  });
});

// Schedule cache invalidation at 2 PM daily
cron.schedule("0 14 * * *", () => {
  console.log("Running scheduled cache update at 2 PM...");
  fetchAndCacheData();
});

// Initial cache fetch on server startup
if (!fs.existsSync(cacheFile)) {
  fetchAndCacheData();
}

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
