import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/erp/dashboard", permanent: false },
      { source: "/dashboard/menu", destination: "/erp/menu", permanent: false },
    ];
  },
};

export default nextConfig;
