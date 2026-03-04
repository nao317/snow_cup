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

- 降雪情報を取得して何かしらのUIで表示する
- マップ上に何かしらのグラフで表示する

# 設計

## システムアーキテクチャ

```
┌─────────────────┐
│   ブラウザ       │
│   (Next.js UI)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Go バックエンド  │
│  (API Server)   │
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│    MySQL DB     │
│  (降雪データ)    │
└─────────────────┘
```

## コンポーネント構成

### フロントエンド (Next.js)
- 降雪情報の表示UI
- インタラクティブマップ表示
- グラフ・チャート表示
- リアルタイムデータ更新

### バックエンド (Go)
- 外部APIから降雪情報を取得
- データの変換・加工
- REST API エンドポイント提供
- データベースへの永続化

### データベース (MySQL)
- 降雪情報の永続化
- 地域・地点情報の管理
- 時系列データの保存

## データフロー

1. **取得処理**：Go バックエンドが定期的に外部API（例：天気API）から降雪データをFetch
2. **保存**：取得したデータをMySQL に保存
3. **API提供**：フロントエンドからのリクエストに対してJSON形式で返却
4. **表示**：Next.js がマップ・グラフとして可視化

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
│   │   │   ├── snow.go          # 降雪データAPI
│   │   │   └── health.go        # ヘルスチェック
│   │   ├── service/             # ビジネスロジック
│   │   │   ├── snow_service.go
│   │   │   └── weather_api.go  # 外部API連携
│   │   ├── repository/          # データアクセス層
│   │   │   ├── snow_repository.go
│   │   │   └── mysql.go         # DB接続
│   │   └── model/               # データモデル
│   │       ├── snow.go
│   │       └── location.go
│   ├── pkg/                     # 公開パッケージ
│   │   └── utils/
│   │       └── time.go
│   └── migrations/              # DBマイグレーション
│       ├── 001_create_snow_data.sql
│       └── 002_create_locations.sql
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
│   │   │   ├── Map/
│   │   │   │   ├── Map.tsx
│   │   │   │   └── Map.module.css
│   │   │   ├── SnowChart/
│   │   │   │   ├── SnowChart.tsx
│   │   │   │   └── SnowChart.module.css
│   │   │   ├── SnowDataCard/
│   │   │   │   ├── SnowDataCard.tsx
│   │   │   │   └── SnowDataCard.module.css
│   │   │   └── Header/
│   │   │       ├── Header.tsx
│   │   │       └── Header.module.css
│   │   ├── lib/                 # ユーティリティ
│   │   │   ├── api.ts           # API クライアント
│   │   │   └── utils.ts
│   │   ├── types/               # TypeScript型定義
│   │   │   ├── snow.ts
│   │   │   └── location.ts
│   │   └── hooks/               # カスタムフック
│   │       ├── useSnowData.ts
│   │       └── useMap.ts
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
  - `GET /api/snow` - 降雪データ一覧
  - `GET /api/snow/:id` - 特定地点の降雪データ
  - `GET /api/locations` - 観測地点一覧
- **service/**: ビジネスロジックと外部API連携
- **repository/**: MySQLとのデータアクセス
- **migrations/**: DBスキーマ定義

### Frontend (Next.js)

- **app/**: App Router によるページ構成
- **components/**: 再利用可能なUIコンポーネント
  - **Map**: 地図表示（Leaflet/Mapbox 使用想定）
  - **SnowChart**: 降雪量グラフ（Chart.js 使用想定）
  - **SnowDataCard**: データカード表示
- **lib/api.ts**: バックエンドAPIとの通信ロジック
- **types/**: TypeScript型定義（バックエンドのモデルと同期）
- **hooks/**: データ取得・状態管理のカスタムフック
- **\*.module.css**: CSS Modules によるスタイリング

### Docker

- **docker-compose.yml**: 3つのサービス（frontend, backend, db）を統合
- 各Dockerfile: 各サービスのコンテナイメージ定義



