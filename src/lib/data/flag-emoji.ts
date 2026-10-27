const REGIONAL_INDICATOR_A = 0x1f1e6;

/** ISO 3166-1 alpha-2 kodundan bölgesel gösterge emoji bayrağı üretir. */
export function flagEmoji(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (normalized.length !== 2 || !/^[A-Z]{2}$/.test(normalized)) {
    return "🌍";
  }
  const first = REGIONAL_INDICATOR_A + (normalized.charCodeAt(0) - 65);
  const second = REGIONAL_INDICATOR_A + (normalized.charCodeAt(1) - 65);
  return String.fromCodePoint(first, second);
}
