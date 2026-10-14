/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages เสิร์ฟไฟล์สำเร็จรูปเท่านั้น → export เป็น HTML ทั้งเว็บ
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }
};

export default nextConfig;
