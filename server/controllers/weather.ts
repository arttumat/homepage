import { Router } from "express";

export const weatherRouter = Router();

weatherRouter.get("/", (_req, res) => {
  fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=62.3030&longitude=25.7228&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m&weather_code&wind_speed_unit=ms",
  )
    .then((r) => r.json())
    .then((data) => res.json(data))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});
