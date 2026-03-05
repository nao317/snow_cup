package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config アプリケーション設定
type Config struct {
	// サーバー
	Port string

	// データベース
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// キャッシュTTL（時間単位）
	CacheTTLHours int

	// CORS
	AllowedOrigins string
}

// Load 環境変数から設定を読み込む
func Load() *Config {
	// .envファイルが存在すれば読み込む（エラーは無視）
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not found, using environment variables")
	}

	cacheTTL := 3
	if v := os.Getenv("CACHE_TTL_HOURS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			cacheTTL = n
		}
	}

	return &Config{
		Port:           getEnv("PORT", "8080"),
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "3306"),
		DBUser:         getEnv("DB_USER", "root"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "snow_cup"),
		CacheTTLHours:  cacheTTL,
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
	}
}

func getEnv(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}
