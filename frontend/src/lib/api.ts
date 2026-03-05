import { GeocodingResponse } from "@/types/location";
import { WeatherResponse } from "@/types/weather";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "/api";

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { cache: "no-store", signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** 地名検索 */
export async function searchGeocoding(
  name: string,
  lang = "en",
  signal?: AbortSignal
): Promise<GeocodingResponse> {
  const params = new URLSearchParams({ name, lang });
  return fetchJSON<GeocodingResponse>(`${API_BASE}/geocoding?${params}`, signal);
}

/** 気象データ取得 */
export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  return fetchJSON<WeatherResponse>(`${API_BASE}/weather?${params}`);
}
