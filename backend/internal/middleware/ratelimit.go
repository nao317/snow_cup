package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// ipBucket IPごとのレートリミット状態
type ipBucket struct {
	tokens    float64
	lastRefil time.Time
	mu        sync.Mutex
}

// RateLimiter IPベースのレートリミットミドルウェア
// maxRequests: 許可する最大リクエスト数
// window: レート制限のウィンドウ（例: 1分）
func RateLimiter(maxRequests int, window time.Duration) gin.HandlerFunc {
	buckets := &sync.Map{}
	rate := float64(maxRequests) / window.Seconds()

	return func(c *gin.Context) {
		ip := c.ClientIP()

		val, _ := buckets.LoadOrStore(ip, &ipBucket{
			tokens:    float64(maxRequests),
			lastRefil: time.Now(),
		})
		bucket := val.(*ipBucket)

		bucket.mu.Lock()
		defer bucket.mu.Unlock()

		// トークンを補充
		now := time.Now()
		elapsed := now.Sub(bucket.lastRefil).Seconds()
		bucket.tokens += elapsed * rate
		if bucket.tokens > float64(maxRequests) {
			bucket.tokens = float64(maxRequests)
		}
		bucket.lastRefil = now

		// トークンが不足している場合はリクエストを拒否
		if bucket.tokens < 1 {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded, please try again later",
			})
			c.Abort()
			return
		}

		bucket.tokens--
		c.Next()
	}
}
