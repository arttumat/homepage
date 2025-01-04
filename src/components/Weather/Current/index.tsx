import { useQuery } from "@tanstack/react-query";
import { WeatherApiResponse } from "../../../../server/types/weather";
import { http } from "../../../axios";
import { getWindDirection, weatherDescriptions } from "../../../utils";

export const CurrentWeather = () => {
  const { data, isLoading, isError } = useQuery<WeatherApiResponse>({
    queryKey: ["weather"],
    queryFn: () =>
      http.get("/weather").then((res) => {
        return res.data;
      }),
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (isError) {
    return <p>Error fetching data</p>;
  }
  if (!data) {
    return null;
  }
  return (
    <div>
      <h2>Current Weather</h2>
      <p>Temperature: {data.current.temperature_2m}°C</p>
      <p>
        Wind speed: {data.current.wind_speed_10m} m/s{" "}
        {getWindDirection(data.current.wind_direction_10m)}
      </p>
      <p>{weatherDescriptions[data.current.weather_code]}</p>
    </div>
  );
};
