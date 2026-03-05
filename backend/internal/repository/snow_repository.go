package repository

import (
	"gorm.io/gorm"
)

// SnowRepository 降雪データのデータアクセス
// 将来的な降雪データの永続化のためのリポジトリ
type SnowRepository struct {
	db *gorm.DB
}

// NewSnowRepository SnowRepositoryのコンストラクタ
func NewSnowRepository(db *gorm.DB) *SnowRepository {
	return &SnowRepository{db: db}
}
