-- 002_create_locations.sql
-- 地点情報テーブル

CREATE TABLE IF NOT EXISTS locations (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255)   NOT NULL COMMENT '地点名',
    latitude   DECIMAL(9, 6)  NOT NULL COMMENT '緯度',
    longitude  DECIMAL(9, 6)  NOT NULL COMMENT '経度',
    country    VARCHAR(100)   COMMENT '国名',
    admin1     VARCHAR(100)   COMMENT '行政区（都道府県など）',
    timezone   VARCHAR(50)    COMMENT 'タイムゾーン',
    is_popular TINYINT(1)     NOT NULL DEFAULT 0 COMMENT '人気地点フラグ',
    created_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_popular (is_popular)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地点情報';

-- プリセット地点の初期データ
INSERT INTO locations (name, latitude, longitude, country, admin1, timezone, is_popular) VALUES
    ('札幌', 43.0618, 141.3545, 'Japan', '北海道', 'Asia/Tokyo', 1),
    ('ニセコ', 42.7853, 140.6870, 'Japan', '北海道', 'Asia/Tokyo', 1),
    ('白馬', 36.6988, 137.8614, 'Japan', '長野県', 'Asia/Tokyo', 1),
    ('蔵王', 38.1343, 140.4413, 'Japan', '宮城県', 'Asia/Tokyo', 1),
    ('東京', 35.6895, 139.6917, 'Japan', '東京都', 'Asia/Tokyo', 0);
