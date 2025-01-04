import { Router } from "express";

export const hnRouter = Router();

hnRouter.get("/", (_req, res) => {
  fetch("https://hnrss.org/newest.jsonfeed?points=150")
    .then((r) => r.json())
    .then((data) => res.json(data))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});
