-- 003_create_cache.sql
-- 気象データキャッシュテーブル

CREATE TABLE IF NOT EXISTS weather_cache (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cache_key  VARCHAR(255) NOT NULL UNIQUE COMMENT 'キャッシュキー',
    data       LONGTEXT     NOT NULL COMMENT 'JSONデータ',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME     NOT NULL COMMENT 'キャッシュ有効期限',
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='気象データキャッシュ';
