import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/api-client", "@repo/types"],
  images: {
    // Imágenes de prueba mientras no hay assets oficiales de Flowerpot.
    // Al reemplazarlas por `/public/...` o el CDN real, quitar estos patrones.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
