import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "192.168.1.172",
    // ngrok domains - cập nhật domain mới mỗi lần chạy ngrok
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok-free.dev",
  ],
};

export default nextConfig;
