import fs from "fs";
import path from "path";
import { SpotData } from "../src/components/Spot/Spot";

export const cacheFile = path.join(__dirname, "cache.json");

export const loadCache = () => {
  if (fs.existsSync(cacheFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      console.log("Cache loaded from file:", new Date(data.timestamp));
      const cacheTimestamp = new Date(data.timestamp);
      const now = new Date();
      if (
        cacheTimestamp.getHours() >= 14 &&
        cacheTimestamp.getDate() < now.getDate()
      ) {
        console.log("Cache is stale, fetching new data...");
        return null;
      }
      return data;
    } catch (err) {
      console.error("Failed to load cache:", err);
    }
  }
  return null;
};

export const saveCache = (data: SpotData) => {
  const cacheData = {
    timestamp: new Date(),
    data,
  };
  fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), "utf8");
  console.log("Cache saved to file:", cacheData.timestamp);
};

export const fetchAndCacheData = async () => {
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
