package model

// Location 地点情報
type Location struct {
ID        int     `json:"id"`
Name      string  `json:"name"`
Latitude  float64 `json:"latitude"`
Longitude float64 `json:"longitude"`
Country   string  `json:"country"`
Admin1    string  `json:"admin1,omitempty"`
Timezone  string  `json:"timezone,omitempty"`
}

// GeocodingResponse ジオコーディングAPIのレスポンス
type GeocodingResponse struct {
Results []Location `json:"results"`
}
