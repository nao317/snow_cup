package model

import "time"

// WeatherCache 気象データキャッシュ
type WeatherCache struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	CacheKey  string    `gorm:"uniqueIndex;size:255;not null" json:"cache_key"`
	Data      string    `gorm:"type:longtext;not null" json:"data"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `gorm:"index;not null" json:"expires_at"`
}

// TableName テーブル名
func (WeatherCache) TableName() string {
	return "weather_cache"
}

// IsExpired キャッシュが期限切れかどうかを確認
func (w *WeatherCache) IsExpired() bool {
	return time.Now().After(w.ExpiresAt)
}
