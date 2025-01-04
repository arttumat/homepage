import { Router } from "express";
import { spotRouter } from "./controllers/spot";
import { hnRouter } from "./controllers/hn";

export const routes = Router();

routes.use("/spot", spotRouter);
routes.use("/hn", hnRouter);
