// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時にESLintエラーで失敗させない
    ignoreDuringBuilds: true,
  },
  // ついでに型エラーでも落としたくない場合は↓を追加
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
