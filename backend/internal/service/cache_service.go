package service

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/nao317/snow_cup/backend/internal/model"
	"github.com/nao317/snow_cup/backend/internal/repository"
)

// CacheService キャッシュのビジネスロジック
type CacheService struct {
	repo     *repository.CacheRepository
	ttlHours int
}

// NewCacheService CacheServiceのコンストラクタ
func NewCacheService(repo *repository.CacheRepository, ttlHours int) *CacheService {
	return &CacheService{repo: repo, ttlHours: ttlHours}
}

// WeatherCacheKey 気象データのキャッシュキーを生成する
func WeatherCacheKey(lat, lon float64) string {
	return fmt.Sprintf("weather:%.4f:%.4f", lat, lon)
}

// GetWeather キャッシュから気象データを取得する（期限切れは無効）
func (s *CacheService) GetWeather(lat, lon float64) (*model.WeatherResponse, error) {
	key := WeatherCacheKey(lat, lon)
	cache, err := s.repo.Get(key)
	if err != nil {
		return nil, err
	}
	if cache == nil || cache.IsExpired() {
		return nil, nil
	}

	var result model.WeatherResponse
	if err := json.Unmarshal([]byte(cache.Data), &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached weather: %w", err)
	}
	return &result, nil
}

// SetWeather 気象データをキャッシュに保存する
func (s *CacheService) SetWeather(lat, lon float64, data *model.WeatherResponse) error {
	key := WeatherCacheKey(lat, lon)

	now := time.Now()
	data.CachedAt = &now

	raw, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal weather data: %w", err)
	}

	cache := &model.WeatherCache{
		CacheKey:  key,
		Data:      string(raw),
		CreatedAt: now,
		ExpiresAt: now.Add(time.Duration(s.ttlHours) * time.Hour),
	}

	return s.repo.Set(cache)
}

// DeleteExpired 期限切れキャッシュを削除する
func (s *CacheService) DeleteExpired() error {
	return s.repo.DeleteExpired()
}
