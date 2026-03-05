package service

import (
	"fmt"
	"log"

	"github.com/nao317/snow_cup/backend/internal/model"
)

// WeatherService 気象データのビジネスロジック
type WeatherService struct {
	client       *OpenMeteoClient
	cacheService *CacheService
}

// NewWeatherService WeatherServiceのコンストラクタ
func NewWeatherService(client *OpenMeteoClient, cache *CacheService) *WeatherService {
	return &WeatherService{
		client:       client,
		cacheService: cache,
	}
}

// GetWeather 緯度経度から気象データを取得する（キャッシュ優先）
func (s *WeatherService) GetWeather(lat, lon float64) (*model.WeatherResponse, error) {
	// 緯度・経度の範囲バリデーション
	if lat < -90 || lat > 90 {
		return nil, fmt.Errorf("latitude out of range: %.4f (must be -90 to 90)", lat)
	}
	if lon < -180 || lon > 180 {
		return nil, fmt.Errorf("longitude out of range: %.4f (must be -180 to 180)", lon)
	}

	// キャッシュサービスが有効な場合はキャッシュを確認
	if s.cacheService != nil {
		cached, err := s.cacheService.GetWeather(lat, lon)
		if err != nil {
			log.Printf("Cache read error (ignoring): %v", err)
		} else if cached != nil {
			log.Printf("Cache hit for lat=%.4f lon=%.4f", lat, lon)
			return cached, nil
		}
	}

	// Open-Meteo APIからデータを取得
	data, err := s.client.FetchWeather(lat, lon)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch weather data: %w", err)
	}

	// キャッシュに保存（エラーはログのみ）
	if s.cacheService != nil {
		if err := s.cacheService.SetWeather(lat, lon, data); err != nil {
			log.Printf("Cache write error (ignoring): %v", err)
		}
	}

	return data, nil
}
