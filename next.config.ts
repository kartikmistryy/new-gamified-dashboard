import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "cryptoicons.org", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/org/:orgId/repo/:repoId/:path*",
        destination: "/org/:orgId/repository/:repoId/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
