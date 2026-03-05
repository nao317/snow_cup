package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nao317/snow_cup/backend/internal/config"
	"github.com/nao317/snow_cup/backend/internal/handler"
	"github.com/nao317/snow_cup/backend/internal/middleware"
	"github.com/nao317/snow_cup/backend/internal/repository"
	"github.com/nao317/snow_cup/backend/internal/service"
)

func main() {
	// 設定読み込み
	cfg := config.Load()

	// データベース接続（失敗してもサーバーは起動）
	var cacheService *service.CacheService
	db, err := repository.NewDB(cfg)
	if err != nil {
		log.Printf("Warning: database connection failed (%v). Running without cache.", err)
	} else {
		cacheRepo := repository.NewCacheRepository(db)
		cacheService = service.NewCacheService(cacheRepo, cfg.CacheTTLHours)
	}

	// サービス層の初期化
	openMeteoClient := service.NewOpenMeteoClient()
	weatherService := service.NewWeatherService(openMeteoClient, cacheService)
	geocodingService := service.NewGeocodingService(openMeteoClient)

	// ハンドラー層の初期化
	weatherHandler := handler.NewWeatherHandler(weatherService)
	geocodingHandler := handler.NewGeocodingHandler(geocodingService)

	// Ginルーターを初期化（デフォルトのロガーを無効化して独自ミドルウェアを使用）
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS(cfg.AllowedOrigins))
	// IPベースのレート制限: 1分間に100リクエストまで
	router.Use(middleware.RateLimiter(100, time.Minute))

	// ルーティング
	router.GET("/health", handler.HealthCheck)

	api := router.Group("/api")
	{
		api.GET("/geocoding", geocodingHandler.Search)
		api.GET("/weather", weatherHandler.GetWeather)
	}

	// サーバー起動
	port := ":" + cfg.Port
	log.Printf("Server starting on port %s", port)
	if err := router.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
