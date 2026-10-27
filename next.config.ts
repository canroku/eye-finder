
import type { NextConfig } from "next";

const isMobileBuild = process.env.MOBILE_BUILD === "1";
const isGitHubPagesBuild = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MOBILE_BUILD: isMobileBuild ? "1" : "0",
  },

  ...(isGitHubPagesBuild
    ? {
        output: "export" as const,
        basePath: "/eye-finder",
        assetPrefix: "/eye-finder/",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : isMobileBuild
      ? {
          output: "export" as const,
          trailingSlash: true,
          images: { unoptimized: true },
        }
      : {}),
};

export default nextConfig;
