// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 完全静的サイトとして出力（out/ を生成）
  output: "export",
  images: { unoptimized: true },       // 画像最適化を無効（静的向け）
  eslint: { ignoreDuringBuilds: true },// CIでESLintエラーで落とさない
  // typescript: { ignoreBuildErrors: true }, // 必要なら一時的に
};

export default nextConfig;
