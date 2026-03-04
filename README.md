# 降雪情報取得アプリ

## 概要

世界中の降雪情報をAPIを叩いて取得するアプリ
C3 Snowカップのためのプロダクト

## 技術構成

- Go
- Nextjs
- MySQL
- Docker

## MVP

- **場所検索**: 地名を入力して世界中の場所を検索できる
- **現在の気象データ**: 選択した場所の現在の降雪・気温などをリアルタイム表示
- **降雪情報の可視化**: 降雪情報を取得して何かしらのUIで表示する
- **マップ表示**: マップ上に何かしらのグラフで表示する

# 設計

## システムアーキテクチャ

```
┌─────────────────┐
│   ブラウザ       │
│   (Next.js UI)   │
└────────┬────────┘
         │ HTTP/REST (内部API)
         ▼
┌─────────────────────────────┐
│  Go バックエンド (APIプロキシ) │
│  - キャッシュ層                │
│  - データ変換                 │
│  - セキュリティ               │
└────┬──────────────────┬─────┘
     │ SQL              │ HTTPS
     ▼                  ▼
┌─────────────┐  ┌──────────────────┐
│  MySQL DB   │  │ Open-Meteo API   │
│ (キャッシュ) │  │  (外部天気API)    │
└─────────────┘  └──────────────────┘
```

**アーキテクチャのポイント**:
- フロントエンドは直接Open-Meteo APIにアクセスせず、必ずバックエンド経由
- バックエンドがプロキシとして機能し、外部APIの詳細を隠蔽
- MySQLを短期キャッシュとして活用（レート制限対策・パフォーマンス向上）

## コンポーネント構成

### フロントエンド (Next.js)
- **場所検索UI**: 地名入力による検索インターフェース
- **現在の気象表示**: リアルタイム降雪量・気温表示
- **降雪情報の表示UI**: 時系列データの表示
- **インタラクティブマップ**: クリックで地点選択可能
- **グラフ・チャート**: 降雪量の推移を可視化
- **リアルタイムデータ更新**: 自動リフレッシュ機能

### バックエンド (Go)
- **APIプロキシ**: Open-Meteo APIへのリクエストを中継
- **キャッシング**: 取得データをMySQLに一時保存（TTL: 1-6時間）
- **データ変換**: Open-Meteo API のレスポンスをフロントエンド用に整形
- **REST API提供**: フロントエンド向けの内部APIエンドポイント
- **レート制限**: 外部APIへの過剰なリクエストを防止
- **セキュリティ**: CORS、入力バリデーション、エラーハンドリング

### データベース (MySQL)
- 降雪情報の永続化
- 地域・地点情報の管理
- 時系列データの保存

## データフロー

### 場所検索フロー
1. **フロントエンド**: ユーザーが地名を入力（例: "Tokyo", "札幌"）
2. **フロントエンド**: `/api/geocoding?name={地名}` をリクエスト
3. **バックエンド**: Open-Meteo Geocoding API に問い合わせ
4. **Geocoding API**: 候補地点リスト（地名、緯度経度、国、行政区）を返却
5. **バックエンド**: 結果を整形してフロントエンドに返却
6. **フロントエンド**: 検索結果をドロップダウンで表示
7. **ユーザー**: 候補から地点を選択 → 緯度経度を取得
8. **次のフローへ**: 取得した緯度経度で気象データを取得

### 気象データ取得フロー（キャッシュあり）
1. **フロントエンド**: 選択した地点の `/api/weather?lat=xxx&lon=xxx&current=true` をリクエスト
2. **バックエンド (キャッシュチェック)**: MySQLにキャッシュがあるか確認（TTL内かチェック）
3. **キャッシュヒット**: キャッシュがあればそのままJSON返却 → 終了
4. **キャッシュミス**: Open-Meteo Weather API へリクエスト
5. **Open-Meteo API**: 現在 + 過去 + 予測の降雪・気象データを返却
6. **バックエンド (保存)**: 取得データをMySQL にキャッシュ保存（TTL付き）
7. **バックエンド (返却)**: データを整形してフロントエンドに返却
   - 現在の気象: `current_weather` フィールド
   - 時系列データ: `hourly` フィールド
8. **フロントエンド (表示)**: 
   - 現在の気象をカード表示
   - マップ上にマーカー配置
   - グラフで時系列を可視化

### バックグラウンド更新（オプション）
- 定期的（例: 3-6時間ごと）に人気地点のデータを事前取得してキャッシュを温める

## API統合 (Open-Meteo API)

### 1. Geocoding API（場所検索）
- **エンドポイント**: `https://geocoding-api.open-meteo.com/v1/search`
- **用途**: 地名から緯度経度を取得
- **パラメータ**:
  - `name`: 検索する地名（例: "Tokyo", "札幌", "New York"）
  - `count`: 返却する候補数（デフォルト: 10）
  - `language`: 言語（`ja`, `en` 等）
  - `format`: レスポンス形式（`json`）

**リクエスト例**:
```
GET https://geocoding-api.open-meteo.com/v1/search?
  name=Tokyo&
  count=10&
  language=ja&
  format=json
```

**レスポンス例**:
```json
{
  "results": [
    {
      "id": 1850144,
      "name": "Tokyo",
      "latitude": 35.6895,
      "longitude": 139.69171,
      "country": "Japan",
      "admin1": "Tokyo",
      "timezone": "Asia/Tokyo"
    }
  ]
}
```

### 2. Weather Forecast API（気象データ）
- **エンドポイント**: `https://api.open-meteo.com/v1/forecast`
- **用途**: 現在・過去・予測の気象データ取得
- **パラメータ**:
  - `latitude`, `longitude`: 緯度経度
  - `current`: 現在の気象（`temperature_2m,snowfall,snow_depth,weather_code`）
  - `hourly`: 時系列データ（`temperature_2m,snowfall,snow_depth`）
  - `past_days`: 過去データ日数（例: 7）
  - `forecast_days`: 予測日数（例: 7）
  - `timezone`: タイムゾーン（`auto` または `Asia/Tokyo`）

**リクエスト例（現在 + 時系列）**:
```
GET https://api.open-meteo.com/v1/forecast?
  latitude=35.68&
  longitude=139.65&
  current=temperature_2m,snowfall,snow_depth,weather_code&
  hourly=temperature_2m,snowfall,snow_depth&
  past_days=7&
  forecast_days=7&
  timezone=auto
```

**レスポンス例**:
```json
{
  "current": {
    "time": "2026-03-04T15:00",
    "temperature_2m": 8.5,
    "snowfall": 0.0,
    "snow_depth": 2.5,
    "weather_code": 3
  },
  "hourly": {
    "time": ["2026-02-26T00:00", ...],
    "temperature_2m": [5.2, 6.1, ...],
    "snowfall": [0.0, 0.5, ...],
    "snow_depth": [0.0, 0.5, ...]
  }
}
```

### バックエンドでの処理

#### Geocoding API（場所検索）
1. フロントエンドから地名を受け取る
2. 入力バリデーション（特殊文字チェック、長さ制限）
3. Open-Meteo Geocoding API へリクエスト
4. レスポンスを整形して返却（最大10件）
5. キャッシュ不要（検索クエリは多様なため）

#### Weather API（気象データ取得）
1. フロントエンドから緯度経度を受け取る
2. パラメータをバリデーション（範囲チェック）
3. キャッシュ確認 → なければOpen-Meteo Weather API へリクエスト
4. レスポンスを正規化・整形
   - タイムゾーン変換
   - 単位統一（摂氏、cm等）
   - 現在の気象データを抽出
5. MySQLにキャッシュ保存（TTL: 1-3時間推奨、現在データは短め）
6. フロントエンドにJSON返却

### Open-Meteo API の特徴
- **無料**: 商用利用可能、API キー不要（ただし attribution 必要）
- **レート制限**: 10,000 リクエスト/日（キャッシュで対策）
- **データ範囲**: 過去80年 + 予測16日間

## セキュリティ対策

### 1. 外部APIの隠蔽
- ✅ フロントエンドから直接Open-Meteo APIにアクセスしない
- ✅ バックエンドでプロキシすることで、外部API URLを隠蔽
- ✅ 将来的にAPI変更があってもフロントエンドは影響を受けない

### 2. CORS (Cross-Origin Resource Sharing)
- バックエンドで適切なCORSヘッダーを設定
- 許可するオリジンをフロントエンドのドメインのみに限定
```go
// example
AllowOrigins: []string{"http://localhost:3000", "https://yourdomain.com"}
```

### 3. レート制限・DoS対策
- **IPベースのレート制限**: 同一IPからの過剰なリクエストを拒否（例: 100req/分）
- **キャッシュ**: 同じリクエストへの重複呼び出しを防止
- Go middleware で実装（例: `golang.org/x/time/rate`）

### 4. 入力バリデーション
- 緯度・経度の範囲チェック（lat: -90 ~ 90, lon: -180 ~ 180）
- SQLインジェクション対策（Prepared Statement使用）
- XSS対策（フロント側でもサニタイズ）

### 5. HTTPSの使用
- 本番環境では必ずHTTPSを使用
- Let's Encryptで無料SSL証明書取得

### 6. 環境変数管理
- センシティブな情報（DB接続情報等）は環境変数で管理
- `.env` ファイルは `.gitignore` に追加
- docker-compose で環境変数を注入

### 7. エラーハンドリング
- 詳細なエラー情報をフロントエンドに返さない（スタックトレース等）
- ログは適切にマスキング（個人情報、認証情報を除外）
- ステータスコードを正しく使用（400, 401, 403, 500等）

### 8. ロギング・モニタリング
- アクセスログを記録（IP、エンドポイント、レスポンスタイム）
- エラーログを収集（外部APIのエラー、DB接続エラー等）
- 異常なトラフィックを検知できる仕組み

## デプロイメント

- すべてのコンポーネントをDockerコンテナ化
- docker-compose で Local/本番環境の構築

## ファイル構成

```
snow_cup/
├── README.md
├── docker-compose.yml           # 全サービスの統合管理
├── .gitignore
│
├── backend/                     # Go バックエンド
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── main.go                  # エントリーポイント
│   ├── cmd/
│   │   └── server/
│   │       └── main.go          # サーバー起動
│   ├── internal/
│   │   ├── config/              # 設定管理
│   │   │   └── config.go
│   │   ├── handler/             # HTTPハンドラー
│   │   │   ├── weather.go       # 気象データAPI
│   │   │   ├── geocoding.go     # 場所検索API
│   │   │   └── health.go        # ヘルスチェック
│   │   ├── middleware/          # ミドルウェア
│   │   │   ├── cors.go          # CORS設定
│   │   │   ├── ratelimit.go     # レート制限
│   │   │   └── logger.go        # ロギング
│   │   ├── service/             # ビジネスロジック
│   │   │   ├── weather_service.go   # 気象データ処理
│   │   │   ├── geocoding_service.go # 場所検索処理
│   │   │   ├── openmeteo.go         # Open-Meteo API クライアント
│   │   │   └── cache_service.go     # キャッシュロジック
│   │   ├── repository/          # データアクセス層
│   │   │   ├── snow_repository.go
│   │   │   ├── cache_repository.go # キャッシュDB操作
│   │   │   └── mysql.go         # DB接続
│   │   └── model/               # データモデル
│   │       ├── weather.go       # 気象データモデル
│   │       ├── location.go      # 地点情報モデル
│   │       └── cache.go         # キャッシュモデル
│   ├── pkg/                     # 公開パッケージ
│   │   └── utils/
│   │       └── time.go
│   ├── migrations/              # DBマイグレーション
│   │   ├── 001_create_weather_data.sql
│   │   ├── 002_create_locations.sql
│   │   └── 003_create_cache.sql     # キャッシュテーブル
│   └── .env.example             # 環境変数サンプル
│
├── frontend/                    # Next.js フロントエンド
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   ├── public/
│   │   ├── favicon.ico
│   │   └── images/
│   ├── src/
│   │   ├── app/                 # App Router
│   │   │   ├── layout.tsx       # ルートレイアウト
│   │   │   ├── page.tsx         # トップページ
│   │   │   ├── page.module.css
│   │   │   └── globals.css
│   │   ├── components/          # 再利用コンポーネント
│   │   │   ├── SearchBar/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── SearchBar.module.css
│   │   │   ├── CurrentWeather/
│   │   │   │   ├── CurrentWeather.tsx
│   │   │   │   └── CurrentWeather.module.css
│   │   │   ├── Map/
│   │   │   │   ├── Map.tsx
│   │   │   │   └── Map.module.css
│   │   │   ├── SnowChart/
│   │   │   │   ├── SnowChart.tsx
│   │   │   │   └── SnowChart.module.css
│   │   │   ├── WeatherCard/
│   │   │   │   ├── WeatherCard.tsx
│   │   │   │   └── WeatherCard.module.css
│   │   │   └── Header/
│   │   │       ├── Header.tsx
│   │   │       └── Header.module.css
│   │   ├── lib/                 # ユーティリティ
│   │   │   ├── api.ts           # API クライアント
│   │   │   └── utils.ts
│   │   ├── types/               # TypeScript型定義
│   │   │   ├── weather.ts       # 気象データ型
│   │   │   └── location.ts      # 地点情報型
│   │   └── hooks/               # カスタムフック
│   │       ├── useWeatherData.ts  # 気象データ取得
│   │       ├── useGeocoding.ts    # 場所検索
│   │       └── useMap.ts          # マップ操作
│   └── .env.local.example       # 環境変数サンプル
│
└── db/                          # データベース設定
    ├── Dockerfile               # MySQL初期化用
    └── init/
        └── init.sql             # 初期データ投入
```

## 主要ファイルの役割

### Backend (Go)

- **main.go**: アプリケーションのエントリーポイント
- **handler/**: REST API エンドポイントの実装
  - `GET /api/geocoding?name={地名}` - 場所検索（候補リスト取得）
  - `GET /api/weather?lat={lat}&lon={lon}&current=true` - 現在の気象 + 時系列データ取得
  - `GET /api/locations` - 人気/プリセット地点一覧
  - `GET /health` - ヘルスチェック
- **middleware/**: 横断的関心事
  - CORS設定、レート制限、ロギング
- **service/**: ビジネスロジック
  - **openmeteo.go**: Open-Meteo API クライアント（Weather & Geocoding）
  - **geocoding_service.go**: 場所検索ロジック、結果のフィルタリング
  - **weather_service.go**: 気象データ変換・集約ロジック、現在データ抽出
  - **cache_service.go**: キャッシュの有効性チェック、TTL管理
- **repository/**: MySQLとのデータアクセス
  - **cache_repository.go**: キャッシュの読み書き
- **migrations/**: DBスキーマ定義（キャッシュテーブル含む）

### Frontend (Next.js)

- **app/**: App Router によるページ構成
- **components/**: 再利用可能なUIコンポーネント
  - **SearchBar**: 場所検索インプット + オートコンプリート
  - **CurrentWeather**: 現在の気象データ表示（気温、降雪量、積雪深）
  - **Map**: 地図表示（Leaflet/Mapbox 使用想定）+ マーカー配置
  - **SnowChart**: 降雪量・積雪深の時系列グラフ（Chart.js 使用想定）
  - **WeatherCard**: 地点ごとの気象データカード
- **lib/api.ts**: バックエンドAPIとの通信ロジック
- **types/**: TypeScript型定義（バックエンドのモデルと同期）
- **hooks/**: データ取得・状態管理のカスタムフック
  - **useGeocoding**: 場所検索（デバウンス処理含む）
  - **useWeatherData**: 気象データ取得、現在データの抽出
- **\*.module.css**: CSS Modules によるスタイリング

### Docker

- **docker-compose.yml**: 3つのサービス（frontend, backend, db）を統合
- 各Dockerfile: 各サービスのコンテナイメージ定義



