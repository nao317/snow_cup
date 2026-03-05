"use client";

import dynamic from "next/dynamic";

/**
 * LeafletはSSRに非対応のため dynamic import でクライアント専用にロード
 */
const SnowMap = dynamic(() => import("./Map"), { ssr: false });

export default SnowMap;
