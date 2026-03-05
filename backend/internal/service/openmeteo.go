package service

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/nao317/snow_cup/backend/internal/model"
)

const (
	geocodingBaseURL = "https://geocoding-api.open-meteo.com/v1/search"
	weatherBaseURL   = "https://api.open-meteo.com/v1/forecast"
)

// openMeteoWeatherResponse Open-Meteo Weather APIの生レスポンス
type openMeteoWeatherResponse struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Timezone  string  `json:"timezone"`
	Current   struct {
		Time        string  `json:"time"`
		Temperature float64 `json:"temperature_2m"`
		Snowfall    float64 `json:"snowfall"`
		SnowDepth   float64 `json:"snow_depth"`
		WeatherCode int     `json:"weather_code"`
	} `json:"current"`
	Hourly struct {
		Time        []string  `json:"time"`
		Temperature []float64 `json:"temperature_2m"`
		Snowfall    []float64 `json:"snowfall"`
		SnowDepth   []float64 `json:"snow_depth"`
	} `json:"hourly"`
}

// openMeteoGeocodingResponse Open-Meteo Geocoding APIの生レスポンス
type openMeteoGeocodingResponse struct {
	Results []struct {
		ID        int     `json:"id"`
		Name      string  `json:"name"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
		Country   string  `json:"country"`
		Admin1    string  `json:"admin1"`
		Timezone  string  `json:"timezone"`
	} `json:"results"`
}

// OpenMeteoClient Open-Meteo APIクライアント
type OpenMeteoClient struct {
	httpClient *http.Client
}

// NewOpenMeteoClient OpenMeteoClientのコンストラクタ
func NewOpenMeteoClient() *OpenMeteoClient {
	return &OpenMeteoClient{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// FetchWeather Open-Meteo Weather APIから気象データを取得する
func (c *OpenMeteoClient) FetchWeather(lat, lon float64) (*model.WeatherResponse, error) {
	params := url.Values{}
	params.Set("latitude", strconv.FormatFloat(lat, 'f', 6, 64))
	params.Set("longitude", strconv.FormatFloat(lon, 'f', 6, 64))
	params.Set("current", "temperature_2m,snowfall,snow_depth,weather_code")
	params.Set("hourly", "temperature_2m,snowfall,snow_depth")
	params.Set("past_days", "7")
	params.Set("forecast_days", "7")
	params.Set("timezone", "auto")

	reqURL := fmt.Sprintf("%s?%s", weatherBaseURL, params.Encode())
	resp, err := c.httpClient.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("failed to request weather API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("weather API returned status %d: %s", resp.StatusCode, string(body))
	}

	var raw openMeteoWeatherResponse
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("failed to decode weather response: %w", err)
	}

	result := &model.WeatherResponse{
		Latitude:  raw.Latitude,
		Longitude: raw.Longitude,
		Timezone:  raw.Timezone,
		Current: model.CurrentWeather{
			Time:        raw.Current.Time,
			Temperature: raw.Current.Temperature,
			Snowfall:    raw.Current.Snowfall,
			SnowDepth:   raw.Current.SnowDepth,
			WeatherCode: raw.Current.WeatherCode,
		},
		Hourly: model.HourlyWeather{
			Time:        raw.Hourly.Time,
			Temperature: raw.Hourly.Temperature,
			Snowfall:    raw.Hourly.Snowfall,
			SnowDepth:   raw.Hourly.SnowDepth,
		},
	}

	return result, nil
}

// FetchGeocoding Open-Meteo Geocoding APIから地点候補を取得する
func (c *OpenMeteoClient) FetchGeocoding(name string, count int, language string) (*model.GeocodingResponse, error) {
	params := url.Values{}
	params.Set("name", name)
	params.Set("count", strconv.Itoa(count))
	params.Set("language", language)
	params.Set("format", "json")

	reqURL := fmt.Sprintf("%s?%s", geocodingBaseURL, params.Encode())
	resp, err := c.httpClient.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("failed to request geocoding API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("geocoding API returned status %d: %s", resp.StatusCode, string(body))
	}

	var raw openMeteoGeocodingResponse
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("failed to decode geocoding response: %w", err)
	}

	result := &model.GeocodingResponse{
		Results: make([]model.Location, 0, len(raw.Results)),
	}
	for _, r := range raw.Results {
		result.Results = append(result.Results, model.Location{
			ID:        r.ID,
			Name:      r.Name,
			Latitude:  r.Latitude,
			Longitude: r.Longitude,
			Country:   r.Country,
			Admin1:    r.Admin1,
			Timezone:  r.Timezone,
		})
	}

	return result, nil
}
