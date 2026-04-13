import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,   // Genera out/<ruta>/index.html → Go Fiber lo sirve nativamente
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
