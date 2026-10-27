import { COUNTRY_REGISTRY } from "@/lib/data/country-registry";

/** Başkent koordinatları — harita noktaları için */
export const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number }> =
  Object.fromEntries(
    COUNTRY_REGISTRY.map((c) => [c.code, { lat: c.lat, lon: c.lon }]),
  );
