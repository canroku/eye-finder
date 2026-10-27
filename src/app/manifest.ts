import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eye Finder — Küresel İlgi Analizi",
    short_name: "Eye Finder",
    description:
      "Profilin dünyanın hangi bölgelerinde daha yüksek ilgi oluşturabilir? Beta v0.2",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#f59e0b",
    orientation: "portrait-primary",
    categories: ["lifestyle", "social"],
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
