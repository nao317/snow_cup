"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import Header from "@/components/Header/Header";
import SearchBar from "@/components/SearchBar/SearchBar";
import CurrentWeather from "@/components/CurrentWeather/CurrentWeather";
import SnowChart from "@/components/SnowChart/SnowChart";
import MapWrapper from "@/components/Map/MapWrapper";
import WeatherCard from "@/components/WeatherCard/WeatherCard";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Location } from "@/types/location";
import styles from "./page.module.css";

/** プリセット地点 */
const PRESET_LOCATIONS: Location[] = [
  { id: 1, name: "札幌", latitude: 43.0618, longitude: 141.3545, country: "日本", admin1: "北海道", timezone: "Asia/Tokyo" },
  { id: 2, name: "ニセコ", latitude: 42.7853, longitude: 140.687, country: "日本", admin1: "北海道", timezone: "Asia/Tokyo" },
  { id: 3, name: "白馬", latitude: 36.6988, longitude: 137.8614, country: "日本", admin1: "長野県", timezone: "Asia/Tokyo" },
  { id: 4, name: "蔵王", latitude: 38.1343, longitude: 140.4413, country: "日本", admin1: "宮城県", timezone: "Asia/Tokyo" },
];

function WeatherSection({ location }: { location: Location }) {
  const { data, isLoading, error, refresh } = useWeatherData(
    location.latitude,
    location.longitude
  );

  return (
    <div className={styles.weatherSection}>
      {isLoading && (
        <div className={styles.loading}>
          <Loader2 className={styles.loadingSpinner} size={24} />
          <span>気象データを取得中...</span>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <AlertTriangle size={16} />
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={refresh}>
            再試行
          </button>
        </div>
      )}

      {data && (
        <>
          <CurrentWeather
            data={data}
            locationName={[location.name, location.admin1, location.country]
              .filter(Boolean)
              .join(", ")}
          />

          <div className={styles.mapChartGrid}>
            <MapWrapper
              lat={location.latitude}
              lon={location.longitude}
              locationName={location.name}
              snowfall={data.current.snowfall}
              snowDepth={data.current.snow_depth}
              temperature={data.current.temperature_2m}
            />
            <SnowChart hourly={data.hourly} />
          </div>

          <p className={styles.autoRefresh}>
            <RefreshCw size={13} />
            5分ごとに自動更新されます
          </p>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleSelect = (loc: Location) => {
    setSelectedLocation(loc);
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* 検索エリア */}
        <section className={styles.searchSection}>
          <h2 className={styles.searchTitle}>場所を検索</h2>
          <SearchBar onSelect={handleSelect} />
        </section>

        {/* プリセット地点 */}
        {!selectedLocation && (
          <section className={styles.presetSection}>
            <h2 className={styles.sectionTitle}>人気のスキーリゾート</h2>
            <div className={styles.presetGrid}>
              {PRESET_LOCATIONS.map((loc) => (
                <PresetCard
                  key={loc.id}
                  location={loc}
                  isSelected={false}
                  onSelect={() => handleSelect(loc)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 選択地点の気象情報 */}
        {selectedLocation && (
          <section className={styles.resultSection}>
            <div className={styles.resultHeader}>
              <h2 className={styles.sectionTitle}>
                {selectedLocation.name} の降雪情報
              </h2>
              <button
                className={styles.backBtn}
                onClick={() => setSelectedLocation(null)}
              >
                <ArrowLeft size={16} />
                一覧に戻る
              </button>
            </div>
            <WeatherSection location={selectedLocation} />
          </section>
        )}
      </main>
    </div>
  );
}

/** プリセット地点カード（気象データ付き） */
function PresetCard({
  location,
  isSelected,
  onSelect,
}: {
  location: Location;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { data } = useWeatherData(location.latitude, location.longitude);

  return (
    <WeatherCard
      name={location.name}
      country={location.admin1 ?? location.country}
      temperature={data?.current.temperature_2m ?? 0}
      snowfall={data?.current.snowfall ?? 0}
      snowDepth={data?.current.snow_depth ?? 0}
      weatherCode={data?.current.weather_code ?? 0}
      onClick={onSelect}
      active={isSelected}
    />
  );
}
