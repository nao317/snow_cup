"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { searchGeocoding } from "@/lib/api";
import { Location } from "@/types/location";

const DEBOUNCE_MS = 400;

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

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchGeocoding(trimmed);
        setResults(data.results ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "検索に失敗しました");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { query, setQuery, results, isLoading, error, clear };
}
