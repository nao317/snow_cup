"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { HourlyWeather } from "@/types/weather";
import { formatDateTimeJa } from "@/lib/utils";
import styles from "./SnowChart.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface SnowChartProps {
  hourly: HourlyWeather;
}

/** 最新72時間のデータを表示する */
const DISPLAY_HOURS = 72;

export default function SnowChart({ hourly }: SnowChartProps) {
  const total = hourly.time.length;
  const start = Math.max(0, total - DISPLAY_HOURS);

  const labels = hourly.time.slice(start).map(formatDateTimeJa);
  const snowfall = hourly.snowfall.slice(start);
  const snowDepth = hourly.snow_depth.slice(start);

  const data = {
    labels,
    datasets: [
      {
        type: "bar" as const,
        label: "降雪量 (cm/h)",
        data: snowfall,
        backgroundColor: "rgba(96, 165, 250, 0.7)",
        borderColor: "rgba(59, 130, 246, 0.9)",
        borderWidth: 1,
        yAxisID: "ySnowfall",
        order: 2,
      },
      {
        type: "bar" as const,
        label: "積雪深 (cm)",
        data: snowDepth,
        backgroundColor: "rgba(165, 243, 252, 0.6)",
        borderColor: "rgba(6, 182, 212, 0.8)",
        borderWidth: 1,
        yAxisID: "ySnowDepth",
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `降雪・積雪推移（直近${DISPLAY_HOURS}時間）`,
        color: "#1e293b",
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: import("chart.js").TooltipItem<"bar">) =>
            `${ctx.dataset.label ?? ""}: ${(ctx.parsed.y ?? 0).toFixed(1)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12,
          font: { size: 10 },
        },
      },
      ySnowfall: {
        type: "linear" as const,
        position: "left" as const,
        title: { display: true, text: "降雪量 (cm/h)", color: "#3b82f6" },
        beginAtZero: true,
        grid: { drawOnChartArea: true },
      },
      ySnowDepth: {
        type: "linear" as const,
        position: "right" as const,
        title: { display: true, text: "積雪深 (cm)", color: "#06b6d4" },
        beginAtZero: true,
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className={styles.wrapper}>
      <Bar data={data} options={options} />
    </div>
  );
}
