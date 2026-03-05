"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { searchGeocoding } from "@/lib/api";
import { Location } from "@/types/location";

const DEBOUNCE_MS = 400;
const MIN_QUERY_LEN = 2;

interface UseGeocodingResult {
  query: string;
  setQuery: (q: string) => void;
  results: Location[];
  isLoading: boolean;
  error: string | null;
  clear: () => void;
}

export function useGeocoding(): UseGeocodingResult {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 進行中のリクエストをキャンセルするための AbortController
  const abortRef = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  useEffect(() => {
    // デバウンスタイマーをクリア
    if (timerRef.current) clearTimeout(timerRef.current);
    // 進行中のリクエストをキャンセル（レース競合防止）
    if (abortRef.current) abortRef.current.abort();

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LEN) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      // 新しい AbortController を作成
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      try {
        const lang = navigator.language.startsWith("ja") ? "ja" : "en";
        const data = await searchGeocoding(trimmed, lang, controller.signal);
        // このリクエストがキャンセルされていなければ結果をセット
        if (!controller.signal.aborted) {
          setResults(data.results ?? []);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "検索に失敗しました");
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { query, setQuery, results, isLoading, error, clear };
}
