package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nao317/snow_cup/backend/internal/service"
)

// GeocodingHandler 場所検索APIのハンドラー
type GeocodingHandler struct {
	geocodingService *service.GeocodingService
}

// NewGeocodingHandler GeocodingHandlerのコンストラクタ
func NewGeocodingHandler(gs *service.GeocodingService) *GeocodingHandler {
	return &GeocodingHandler{geocodingService: gs}
}

// Search 地名から候補地点を検索するエンドポイント
// GET /api/geocoding?name={地名}
func (h *GeocodingHandler) Search(c *gin.Context) {
	name := c.Query("name")

	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "name query parameter is required",
		})
		return
	}

	result, err := h.geocodingService.Search(name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}
