package utils

import "time"

// FormatJST 時刻をJSTのRFC3339形式に変換する
func FormatJST(t time.Time) string {
	jst, err := time.LoadLocation("Asia/Tokyo")
	if err != nil {
		return t.Format(time.RFC3339)
	}
	return t.In(jst).Format(time.RFC3339)
}

// ParseOpenMeteoTime Open-Meteoの時刻文字列（"2006-01-02T15:04"）をtime.Timeに変換する
func ParseOpenMeteoTime(s string) (time.Time, error) {
	return time.Parse("2006-01-02T15:04", s)
}
