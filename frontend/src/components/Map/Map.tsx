"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Map.module.css";

// Leafletのデフォルトアイコン問題を修正
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  lat: number;
  lon: number;
}

/** 地図中心を更新するインナーコンポーネント */
function MapCenterUpdater({ lat, lon }: MapViewProps) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 10, { animate: true });
  }, [lat, lon, map]);
  return null;
}

interface SnowMapProps {
  lat: number;
  lon: number;
  locationName?: string;
  snowfall?: number;
  snowDepth?: number;
  temperature?: number;
}

export default function SnowMap({
  lat,
  lon,
  locationName,
  snowfall,
  snowDepth,
  temperature,
}: SnowMapProps) {
  return (
    <div className={styles.wrapper}>
      <MapContainer
        center={[lat, lon]}
        zoom={10}
        className={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapCenterUpdater lat={lat} lon={lon} />
        <Marker position={[lat, lon]}>
          <Popup>
            <div className={styles.popup}>
              <strong>{locationName ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`}</strong>
              {temperature !== undefined && (
                <p>🌡️ 気温: {temperature.toFixed(1)} °C</p>
              )}
              {snowfall !== undefined && (
                <p>🌨️ 降雪量: {snowfall.toFixed(1)} cm/h</p>
              )}
              {snowDepth !== undefined && (
                <p>❄️ 積雪深: {snowDepth.toFixed(0)} cm</p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
