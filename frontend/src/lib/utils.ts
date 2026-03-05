/**
 * WMOコードから天気の説明テキストを返す
 */
export function describeWeatherCode(code: number): string {
  if (code === 0) return "快晴";
  if (code <= 2) return "晴れ";
  if (code === 3) return "曇り";
  if (code <= 49) return "霧";
  if (code <= 59) return "霧雨";
  if (code <= 69) return "雨";
  if (code <= 79) return "雪";
  if (code <= 82) return "にわか雨";
  if (code <= 86) return "にわか雪";
  if (code <= 99) return "雷雨";
  return "不明";
}

/**
 * ISO 8601文字列を日本語の短い形式に変換: "3/5 15:00"
 */
export function formatDateTimeJa(isoStr: string): string {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hh}:${mm}`;
}

/**
 * 数値を小数点1桁で丸める
 */
export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
