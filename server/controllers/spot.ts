import { Router } from "express";
import { fetchAndCacheData, loadCache } from "../utils";

export const spotRouter = Router();

spotRouter.get("/", (_req, res) => {
  const cache = loadCache();
  if (cache && cache.data) {
    res.json(cache.data);
    return;
  }

  fetchAndCacheData()
    .then(() => {
      const newCache = loadCache();
      res.json(newCache ? newCache.data : {});
    })
    .catch(() => res.status(500).send("Failed to fetch data"));
});
