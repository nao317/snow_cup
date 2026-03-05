package model

import "time"

// CurrentWeather 現在の気象データ
type CurrentWeather struct {
	Time        string  `json:"time"`
	Temperature float64 `json:"temperature_2m"`
	Snowfall    float64 `json:"snowfall"`
	SnowDepth   float64 `json:"snow_depth"`
	WeatherCode int     `json:"weather_code"`
}

// HourlyWeather 時系列気象データ
type HourlyWeather struct {
	Time        []string  `json:"time"`
	Temperature []float64 `json:"temperature_2m"`
	Snowfall    []float64 `json:"snowfall"`
	SnowDepth   []float64 `json:"snow_depth"`
}

// WeatherResponse バックエンドからフロントエンドへのレスポンス
type WeatherResponse struct {
	Latitude  float64        `json:"latitude"`
	Longitude float64        `json:"longitude"`
	Timezone  string         `json:"timezone"`
	Current   CurrentWeather `json:"current"`
	Hourly    HourlyWeather  `json:"hourly"`
	CachedAt  *time.Time     `json:"cached_at,omitempty"`
}
