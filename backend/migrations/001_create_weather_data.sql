-- 001_create_weather_data.sql
-- 気象データテーブル（将来的な永続化用）

CREATE TABLE IF NOT EXISTS weather_data (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    latitude    DECIMAL(9, 6)  NOT NULL,
    longitude   DECIMAL(9, 6)  NOT NULL,
    recorded_at DATETIME       NOT NULL,
    temperature DECIMAL(5, 2)  COMMENT '気温 (°C)',
    snowfall    DECIMAL(6, 2)  COMMENT '降雪量 (cm)',
    snow_depth  DECIMAL(6, 2)  COMMENT '積雪深 (cm)',
    weather_code SMALLINT      COMMENT 'WMOコード',
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_lat_lon (latitude, longitude),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='気象データ';
