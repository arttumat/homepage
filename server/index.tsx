import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import ReactApp from "../src/App";
import cors from "cors";
import cron from "node-cron";
import path from "path";
import fs from "fs";
import { SpotData } from "../src/components/Spot/Spot";

const app = express();
app.use(cors());

app.use("/static", express.static("dist"));

const cacheFile = path.join(__dirname, "cache.json");

const loadCache = () => {
  if (fs.existsSync(cacheFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      console.log("Cache loaded from file:", new Date(data.timestamp));
      return data;
    } catch (err) {
      console.error("Failed to load cache:", err);
    }
  }
  return null;
};

const saveCache = (data: SpotData) => {
  const cacheData = {
    timestamp: new Date(),
    data,
  };
  fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), "utf8");
  console.log("Cache saved to file:", cacheData.timestamp);
};

const fetchAndCacheData = async () => {
  try {
    const response = await fetch(
      "https://api.porssisahko.net/v1/latest-prices.json",
    );
    const data = await response.json();
    saveCache(data);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

app.get("/hn", (_req, res) => {
  fetch("https://hnrss.org/newest.jsonfeed?points=150")
    .then((r) => r.json())
    .then((data) => res.json(data))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/spot", (_req, res) => {
  const cache = loadCache();
  if (cache && cache.data) {
    res.json(cache.data);
    return;
  }

  // If cache is empty, fetch immediately
  fetchAndCacheData()
    .then(() => {
      const newCache = loadCache();
      res.json(newCache ? newCache.data : {});
    })
    .catch(() => res.status(500).send("Failed to fetch data"));
});

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
