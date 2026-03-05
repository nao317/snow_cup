import {
  Sun,
  Cloud,
  CloudSnow,
  CloudRain,
  CloudFog,
  Snowflake,
  Layers,
} from "lucide-react";
import styles from "./WeatherCard.module.css";

interface WeatherCardProps {
  name: string;
  country?: string;
  temperature: number;
  snowfall: number;
  snowDepth: number;
  weatherCode: number;
  onClick?: () => void;
  active?: boolean;
}

function WeatherIcon({ code }: { code: number }) {
  const props = { size: 28, strokeWidth: 1.5, className: styles.weatherIcon };
  if (code === 0) return <Sun {...props} />;
  if (code <= 3) return <Cloud {...props} />;
  if (code <= 49) return <CloudFog {...props} />;
  if (code <= 69) return <CloudRain {...props} />;
  return <CloudSnow {...props} />;
}

export default function WeatherCard({
  name,
  country,
  temperature,
  snowfall,
  snowDepth,
  weatherCode,
  onClick,
  active = false,
}: WeatherCardProps) {
  return (
    <button
      className={`${styles.card} ${active ? styles.active : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className={styles.top}>
        <WeatherIcon code={weatherCode} />
        <span className={styles.temp}>{Math.round(temperature)}°C</span>
      </div>
      <p className={styles.name}>{name}</p>
      {country && <p className={styles.country}>{country}</p>}
      <div className={styles.stats}>
        <span className={styles.stat} title="降雪量">
          <Snowflake size={13} />
          {snowfall.toFixed(1)}cm/h
        </span>
        <span className={styles.stat} title="積雪深">
          <Layers size={13} />
          {snowDepth.toFixed(0)}cm
        </span>
      </div>
    </button>
  );
}
