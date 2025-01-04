import { Router } from "express";
import { spotRouter } from "./controllers/spot";
import { hnRouter } from "./controllers/hn";
import { yleRouter } from "./controllers/yle";

export const routes = Router();

routes.use("/spot", spotRouter);
routes.use("/hn", hnRouter);
routes.use("/yle", yleRouter);
