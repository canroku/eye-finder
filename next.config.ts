import type { NextConfig } from "next";

const isMobileBuild = process.env.MOBILE_BUILD === "1";
// GitHub Pages serves the static export from https://canroku.github.io/eye-finder/
const isGithubPagesBuild = process.env.GITHUB_PAGES === "1";
const githubPagesBasePath = "/eye-finder";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MOBILE_BUILD: isMobileBuild || isGithubPagesBuild ? "1" : "0",
    NEXT_PUBLIC_GITHUB_PAGES: isGithubPagesBuild ? "1" : "0",
    NEXT_PUBLIC_BASE_PATH: isGithubPagesBuild ? githubPagesBasePath : "",
  },
  ...(isMobileBuild
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  ...(isGithubPagesBuild
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        basePath: githubPagesBasePath,
        assetPrefix: githubPagesBasePath,
      }
    : {}),
};

export default nextConfig;
