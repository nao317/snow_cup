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

const WEATHER_ICONS: Record<string, string> = {
  clear: "☀️",
  cloudy: "☁️",
  snow: "❄️",
  rain: "🌧️",
  fog: "🌫️",
};

function getIcon(code: number): string {
  if (code === 0) return WEATHER_ICONS.clear;
  if (code <= 3) return WEATHER_ICONS.cloudy;
  if (code <= 49) return WEATHER_ICONS.fog;
  if (code <= 69) return WEATHER_ICONS.rain;
  return WEATHER_ICONS.snow;
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
        <span className={styles.icon}>{getIcon(weatherCode)}</span>
        <span className={styles.temp}>{Math.round(temperature)}°C</span>
      </div>
      <p className={styles.name}>{name}</p>
      {country && <p className={styles.country}>{country}</p>}
      <div className={styles.stats}>
        <span title="降雪量">🌨 {snowfall.toFixed(1)}cm/h</span>
        <span title="積雪深">❄ {snowDepth.toFixed(0)}cm</span>
      </div>
    </button>
  );
}
