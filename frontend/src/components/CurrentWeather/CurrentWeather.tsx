import { Thermometer, CloudSnow, Layers, MapPin } from "lucide-react";
import { WeatherResponse } from "@/types/weather";
import { describeWeatherCode, round1 } from "@/lib/utils";
import styles from "./CurrentWeather.module.css";

interface CurrentWeatherProps {
  data: WeatherResponse;
  locationName?: string;
}

export default function CurrentWeather({
  data,
  locationName,
}: CurrentWeatherProps) {
  const { current } = data;

  const items = [
    {
      icon: <Thermometer size={28} strokeWidth={1.5} />,
      label: "気温",
      value: `${round1(current.temperature_2m)} °C`,
    },
    {
      icon: <CloudSnow size={28} strokeWidth={1.5} />,
      label: "降雪量",
      value: `${round1(current.snowfall)} cm/h`,
    },
    {
      icon: <Layers size={28} strokeWidth={1.5} />,
      label: "積雪深",
      value: `${round1(current.snow_depth)} cm`,
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.location}>
          <MapPin size={14} className={styles.locationIcon} />
          {locationName ?? `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`}
        </span>
        <span className={styles.weather}>
          {describeWeatherCode(current.weather_code)}
        </span>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.label} className={styles.item}>
            <span className={styles.itemIcon}>{item.icon}</span>
            <span className={styles.itemValue}>{item.value}</span>
            <span className={styles.itemLabel}>{item.label}</span>
          </div>
        ))}
      </div>

      <p className={styles.time}>観測時刻: {current.time.replace("T", " ")}</p>
    </div>
  );
}
