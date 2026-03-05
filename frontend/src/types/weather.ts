export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  snowfall: number;
  snow_depth: number;
  weather_code: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  snowfall: number[];
  snow_depth: number[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyWeather;
  cached_at?: string;
}
