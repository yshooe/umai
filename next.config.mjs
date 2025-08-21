// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ★ ここに output: 'export' を置かない（SSR不可になる）
  // 画像最適化を使わないなら下記は任意
  images: { unoptimized: true },
};

export default nextConfig;
