/** @type {import('next').NextConfig} */
const nextConfig = {
  // 完全静的サイトとして出力（out/ を生成）
  output: "export",
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true }, // 必要なら一時的に
};

export default nextConfig;
