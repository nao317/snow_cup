"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWeather } from "@/lib/api";
import { WeatherResponse } from "@/types/weather";

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5分ごとに自動更新

interface UseWeatherDataResult {
  data: WeatherResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWeatherData(
  lat: number | null,
  lon: number | null
): UseWeatherDataResult {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (lat === null || lon === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchWeather(lat, lon);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "データ取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [lat, lon]);

  // 地点が変わったら再取得
  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  // 自動リフレッシュ
  useEffect(() => {
    if (lat === null || lon === null) return;
    const interval = setInterval(load, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [lat, lon, load]);

  return { data, isLoading, error, refresh: load };
}
