import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snow Cup - 降雪情報",
  description: "世界中の降雪情報をリアルタイムで確認",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
