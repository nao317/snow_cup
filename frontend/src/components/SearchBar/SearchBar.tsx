"use client";

import { useRef, useEffect } from "react";
import { useGeocoding } from "@/hooks/useGeocoding";
import { Location } from "@/types/location";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  onSelect: (location: Location) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const { query, setQuery, results, isLoading, error, clear } = useGeocoding();
  const containerRef = useRef<HTMLDivElement>(null);

  // コンテナ外クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        clear();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [clear]);

  const handleSelect = (loc: Location) => {
    onSelect(loc);
    clear();
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <span className={styles.icon}>🔍</span>
        <input
          type="text"
          className={styles.input}
          placeholder="地名を入力（例: 札幌、Niseko、Zermatt）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="場所を検索"
          aria-autocomplete="list"
          aria-expanded={results.length > 0}
        />
        {isLoading && <span className={styles.spinner} aria-label="検索中" />}
        {query && (
          <button
            className={styles.clearBtn}
            onClick={clear}
            aria-label="クリア"
          >
            ✕
          </button>
        )}
      </div>

      {error && <p className={styles.error}>⚠ {error}</p>}

      {results.length > 0 && (
        <ul className={styles.dropdown} role="listbox">
          {results.map((loc) => (
            <li
              key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
              className={styles.item}
              role="option"
              onClick={() => handleSelect(loc)}
              onKeyDown={(e) => e.key === "Enter" && handleSelect(loc)}
              tabIndex={0}
            >
              <span className={styles.itemName}>{loc.name}</span>
              <span className={styles.itemSub}>
                {[loc.admin1, loc.country].filter(Boolean).join(", ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
