"use client";

import { useState, useCallback } from "react";

interface MapState {
  lat: number;
  lon: number;
  zoom: number;
}

interface UseMapResult {
  mapState: MapState;
  setCenter: (lat: number, lon: number) => void;
  setZoom: (zoom: number) => void;
}

const DEFAULT_STATE: MapState = {
  lat: 35.6895,
  lon: 139.6917,
  zoom: 5,
};

export function useMap(): UseMapResult {
  const [mapState, setMapState] = useState<MapState>(DEFAULT_STATE);

  const setCenter = useCallback((lat: number, lon: number) => {
    setMapState((prev) => ({ ...prev, lat, lon }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setMapState((prev) => ({ ...prev, zoom }));
  }, []);

  return { mapState, setCenter, setZoom };
}
