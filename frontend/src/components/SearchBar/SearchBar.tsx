"use client";

import { useRef, useEffect } from "react";
import { Search, X, MapPin, Loader2 } from "lucide-react";
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
        <Search className={styles.icon} size={18} />
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
        {isLoading && (
          <Loader2 className={styles.spinner} size={16} aria-label="検索中" />
        )}
        {query && !isLoading && (
          <button
            className={styles.clearBtn}
            onClick={clear}
            aria-label="クリア"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && (
        <p className={styles.error}>
          <X size={14} /> {error}
        </p>
      )}

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
              <MapPin className={styles.itemIcon} size={14} />
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

interface SearchBarProps {
  onSelect: (location: Location) => void;
}

