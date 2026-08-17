import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/((?!api|_next|favicon.ico|.*\\..*).*)",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
