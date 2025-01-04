import { Router } from "express";
import { transformYleApiResponse } from "../transformation/yle";

export const yleRouter = Router();

yleRouter.get("/", (_req, res) => {
  fetch(
    " https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.yle.fi%2Fuutiset%2Fv1%2FmajorHeadlines%2FYLE_UUTISET.rss",
  )
    .then((r) => r.json())
    .then((data) => res.json(transformYleApiResponse(data)))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});
