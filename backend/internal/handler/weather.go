package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nao317/snow_cup/backend/internal/service"
)

// WeatherHandler 気象データAPIのハンドラー
type WeatherHandler struct {
	weatherService *service.WeatherService
}

// NewWeatherHandler WeatherHandlerのコンストラクタ
func NewWeatherHandler(ws *service.WeatherService) *WeatherHandler {
	return &WeatherHandler{weatherService: ws}
}

// GetWeather 気象データを取得するエンドポイント
// GET /api/weather?lat={lat}&lon={lon}
func (h *WeatherHandler) GetWeather(c *gin.Context) {
	latStr := c.Query("lat")
	lonStr := c.Query("lon")

	if latStr == "" || lonStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "lat and lon query parameters are required",
		})
		return
	}

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid lat value: must be a number",
		})
		return
	}

	lon, err := strconv.ParseFloat(lonStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid lon value: must be a number",
		})
		return
	}

	data, err := h.weatherService.GetWeather(lat, lon)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, data)
}
