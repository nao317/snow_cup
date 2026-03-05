package service

import (
	"fmt"
	"unicode/utf8"

	"github.com/nao317/snow_cup/backend/internal/model"
)

const (
	maxSearchNameLength = 100
	defaultResultCount  = 10
	defaultLanguage     = "ja"
)

// GeocodingService 場所検索のビジネスロジック
type GeocodingService struct {
	client *OpenMeteoClient
}

// NewGeocodingService GeocodingServiceのコンストラクタ
func NewGeocodingService(client *OpenMeteoClient) *GeocodingService {
	return &GeocodingService{client: client}
}

// Search 地名から候補地点を検索する
func (s *GeocodingService) Search(name string) (*model.GeocodingResponse, error) {
	// 入力バリデーション
	if name == "" {
		return nil, fmt.Errorf("name is required")
	}
	if utf8.RuneCountInString(name) > maxSearchNameLength {
		return nil, fmt.Errorf("name too long (max %d characters)", maxSearchNameLength)
	}

	result, err := s.client.FetchGeocoding(name, defaultResultCount, defaultLanguage)
	if err != nil {
		return nil, fmt.Errorf("geocoding search failed: %w", err)
	}

	// 結果が空の場合は空リストを返す
	if result == nil {
		return &model.GeocodingResponse{Results: []model.Location{}}, nil
	}

	return result, nil
}
