package repository

import (
	"errors"

	"github.com/nao317/snow_cup/backend/internal/model"
	"gorm.io/gorm"
)

// CacheRepository キャッシュのデータアクセス
type CacheRepository struct {
	db *gorm.DB
}

// NewCacheRepository CacheRepositoryのコンストラクタ
func NewCacheRepository(db *gorm.DB) *CacheRepository {
	return &CacheRepository{db: db}
}

// Get キャッシュキーでキャッシュを取得する
func (r *CacheRepository) Get(cacheKey string) (*model.WeatherCache, error) {
	var cache model.WeatherCache
	result := r.db.Where("cache_key = ?", cacheKey).First(&cache)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if result.Error != nil {
		return nil, result.Error
	}
	return &cache, nil
}

// Set キャッシュを保存する（既存があれば更新）
func (r *CacheRepository) Set(cache *model.WeatherCache) error {
	return r.db.Save(cache).Error
}

// Delete キャッシュを削除する
func (r *CacheRepository) Delete(cacheKey string) error {
	return r.db.Where("cache_key = ?", cacheKey).Delete(&model.WeatherCache{}).Error
}

// DeleteExpired 期限切れキャッシュを一括削除する
func (r *CacheRepository) DeleteExpired() error {
	return r.db.Where("expires_at < NOW()").Delete(&model.WeatherCache{}).Error
}
