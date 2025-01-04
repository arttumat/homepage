export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: CurrentUnits;
  current: CurrentWeather;
  hourly_units: HourlyUnits;
  hourly: HourlyData;
}

export interface CurrentUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  relative_humidity_2m: string;
  apparent_temperature: string;
  precipitation: string;
  rain: string;
  showers: string;
  snowfall: string;
  weather_code: string;
  cloud_cover: string;
  wind_speed_10m: string;
  wind_direction_10m: string;
  wind_gusts_10m: string;
}

export interface CurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface HourlyUnits {
  time: string;
  temperature_2m: string;
}

export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
}
