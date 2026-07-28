import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.racefans.net" },
      { protocol: "https", hostname: "www.racefans.net" },
      { protocol: "https", hostname: "**.autosport.com" },
      { protocol: "https", hostname: "www.autosport.com" },
      { protocol: "https", hostname: "cdn-1.motorsport.com" },
      { protocol: "https", hostname: "cdn-2.motorsport.com" },
      { protocol: "https", hostname: "cdn-3.motorsport.com" },
      { protocol: "https", hostname: "cdn-4.motorsport.com" },
      { protocol: "https", hostname: "cdn-5.motorsport.com" },
      { protocol: "https", hostname: "**.motorsport.com" },
      { protocol: "https", hostname: "ichef.bbci.co.uk" },
      { protocol: "https", hostname: "**.bbci.co.uk" },
      { protocol: "https", hostname: "**.bbc.co.uk" },
      { protocol: "https", hostname: "**.bbc.com" },
      { protocol: "https", hostname: "**.wp.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.formula1.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
