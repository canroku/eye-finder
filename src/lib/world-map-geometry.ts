/** simple-world-map SVG viewBox (flekschas/simple-world-map, CC BY-SA 3.0) */
export const WORLD_MAP_VIEW = {
  x: 30.767,
  y: 241.591,
  w: 784.077,
  h: 458.627,
} as const;

export type MapViewState = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export const DEFAULT_MAP_VIEW: MapViewState = { ...WORLD_MAP_VIEW };

export function viewToString(v: MapViewState): string {
  return `${v.x} ${v.y} ${v.w} ${v.h}`;
}

const MAX_ZOOM = 5;
const MIN_ZOOM = 1;

export function clampMapView(v: MapViewState): MapViewState {
  const minW = WORLD_MAP_VIEW.w / MAX_ZOOM;
  const maxW = WORLD_MAP_VIEW.w * MIN_ZOOM;
  const w = Math.min(maxW, Math.max(minW, v.w));
  const h = w * (WORLD_MAP_VIEW.h / WORLD_MAP_VIEW.w);
  const x = Math.max(WORLD_MAP_VIEW.x, Math.min(WORLD_MAP_VIEW.x + WORLD_MAP_VIEW.w - w, v.x));
  const y = Math.max(WORLD_MAP_VIEW.y, Math.min(WORLD_MAP_VIEW.y + WORLD_MAP_VIEW.h - h, v.y));
  return { x, y, w, h };
}

/** factor < 1 = zoom in, > 1 = zoom out; cx/cy in SVG coords */
export function zoomMapView(
  state: MapViewState,
  factor: number,
  cx: number,
  cy: number,
): MapViewState {
  const w = state.w * factor;
  const h = state.h * factor;
  const rx = (cx - state.x) / state.w;
  const ry = (cy - state.y) / state.h;
  return clampMapView({
    x: cx - rx * w,
    y: cy - ry * h,
    w,
    h,
  });
}

export function panMapView(state: MapViewState, dx: number, dy: number): MapViewState {
  return clampMapView({ ...state, x: state.x - dx, y: state.y - dy });
}

/** Ekran koordinatını SVG viewBox koordinatına çevirir */
export function screenToSvg(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  view: MapViewState,
): { x: number; y: number } {
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  return {
    x: view.x + nx * view.w,
    y: view.y + ny * view.h,
  };
}

export type MapShapePath = { d: string; className?: string };

export type MapShape = {
  svgId: string;
  paths: MapShapePath[];
};

export function parseWorldMapSvg(svgText: string): MapShape[] {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const root = doc.querySelector("svg");
  if (!root) return [];

  const shapes: MapShape[] = [];
  const grouped = new Set<string>();

  root.querySelectorAll("g[id]").forEach((g) => {
    const svgId = g.getAttribute("id");
    if (!svgId) return;
    const paths = Array.from(g.querySelectorAll("path"))
      .map((p) => ({
        d: p.getAttribute("d") ?? "",
        className: p.getAttribute("class") ?? undefined,
      }))
      .filter((p) => p.d);
    if (paths.length) {
      shapes.push({ svgId, paths });
      grouped.add(svgId);
    }
  });

  root.querySelectorAll(":scope > path[id]").forEach((p) => {
    const svgId = p.getAttribute("id");
    const d = p.getAttribute("d");
    if (!svgId || !d || grouped.has(svgId)) return;
    shapes.push({
      svgId,
      paths: [{ d, className: p.getAttribute("class") ?? undefined }],
    });
  });

  return shapes;
}

let shapesCache: Promise<MapShape[]> | null = null;

export function loadWorldMapShapes(): Promise<MapShape[]> {
  if (!shapesCache) {
    shapesCache = fetch("/maps/world-outline.svg")
      .then((r) => r.text())
      .then(parseWorldMapSvg);
  }
  return shapesCache;
}

/** Uygulama ISO kodu → SVG id (çoğu küçük harf) */
export function appCodeToSvgId(code: string): string {
  return code.toLowerCase();
}

export function svgIdToAppCode(svgId: string): string {
  if (svgId.startsWith("_")) return svgId.slice(1).toUpperCase();
  return svgId.toUpperCase();
}
