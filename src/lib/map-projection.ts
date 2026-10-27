import { COUNTRY_COORDINATES } from "@/lib/data/country-coordinates";

/** Equirectangular — simple-world-map viewBox ile uyumlu yüzde konum */
export function latLonToMapPercent(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return {
    x: Math.min(98, Math.max(2, x)),
    y: Math.min(96, Math.max(4, y)),
  };
}

export function getCountryMapPosition(code: string): { x: number; y: number } {
  const c = COUNTRY_COORDINATES[code];
  if (!c) return { x: 50, y: 50 };
  return latLonToMapPercent(c.lat, c.lon);
}

/** simple-world-map SVG viewBox — marker hizası için */
export const WORLD_MAP_VIEWBOX = "30.767 241.591 784.077 458.627";
