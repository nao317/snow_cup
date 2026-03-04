package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nao317/snow_cup/backend/internal/handler"
)

func main() {
	// Ginルーターを初期化
	router := gin.Default()

	// CORS設定（開発用）
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	})

	// ヘルスチェックエンドポイント
	router.GET("/health", handler.HealthCheck)

	// サーバー起動
	port := ":8080"
	log.Printf("Server starting on port %s", port)
	if err := router.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
