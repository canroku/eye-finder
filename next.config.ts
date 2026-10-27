import type { NextConfig } from "next";

const isMobileBuild = process.env.MOBILE_BUILD === "1";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MOBILE_BUILD: isMobileBuild ? "1" : "0",
  },
  ...(isMobileBuild
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
