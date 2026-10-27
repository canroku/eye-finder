"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CountryResult } from "@/lib/types";
import {
  DEFAULT_MAP_VIEW,
  loadWorldMapShapes,
  panMapView,
  screenToSvg,
  viewToString,
  zoomMapView,
  type MapShape,
  type MapViewState,
} from "@/lib/world-map-geometry";

interface Props {
  countries: CountryResult[];
  selectedCode?: string;
  onSelect: (country: CountryResult) => void;
}

function affinityFill(intensity: number, selected: boolean): string {
  const pct = Math.round((0.35 + intensity * 0.55) * 100);
  const base = selected ? "#71717a" : "#3f3f46";
  return `color-mix(in srgb, var(--accent) ${pct}%, ${base})`;
}

export function WorldMapChoropleth({ countries, selectedCode, onSelect }: Props) {
  const [shapes, setShapes] = useState<MapShape[]>([]);
  const [view, setView] = useState<MapViewState>(DEFAULT_MAP_VIEW);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const panRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const maxAffinity = Math.max(...countries.map((c) => c.compatibility.affinity), 1);

  const resultBySvgId = useMemo(() => {
    const map = new Map<string, CountryResult>();
    countries.forEach((c) => map.set(c.compatibility.countryCode.toLowerCase(), c));
    return map;
  }, [countries]);

  useEffect(() => {
    let cancelled = false;
    loadWorldMapShapes()
      .then((data) => {
        if (!cancelled) {
          setShapes(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyZoom = useCallback((factor: number, clientX?: number, clientY?: number) => {
    setView((prev) => {
      const rect = svgRef.current?.getBoundingClientRect();
      let cx = prev.x + prev.w / 2;
      let cy = prev.y + prev.h / 2;
      if (rect && clientX != null && clientY != null) {
        const pt = screenToSvg(clientX, clientY, rect, prev);
        cx = pt.x;
        cy = pt.y;
      }
      return zoomMapView(prev, factor, cx, cy);
    });
  }, []);

  const resetView = useCallback(() => setView(DEFAULT_MAP_VIEW), []);

  const onWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.12 : 0.88;
      applyZoom(factor, e.clientX, e.clientY);
    },
    [applyZoom],
  );

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const target = e.target as Element;
    if (target.closest("[data-country]")) return;
    panRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!panRef.current.active || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setView((prev) => {
      const dx = ((e.clientX - panRef.current.lastX) / rect.width) * prev.w;
      const dy = ((e.clientY - panRef.current.lastY) / rect.height) * prev.h;
      panRef.current.lastX = e.clientX;
      panRef.current.lastY = e.clientY;
      return panMapView(prev, dx, dy);
    });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    panRef.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const handleCountryClick = useCallback(
    (svgId: string) => {
      const result = resultBySvgId.get(svgId);
      if (result) onSelect(result);
    },
    [onSelect, resultBySvgId],
  );

  return (
    <div className="relative h-full w-full select-none">
      <div className="absolute right-2 top-2 z-20 flex flex-col gap-1">
        <button
          type="button"
          aria-label="Yakınlaştır"
          onClick={() => applyZoom(0.82)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/90 text-sm text-zinc-200 hover:border-accent-dim"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Uzaklaştır"
          onClick={() => applyZoom(1.18)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/90 text-sm text-zinc-200 hover:border-accent-dim"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Haritayı sıfırla"
          onClick={resetView}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/90 text-[10px] text-zinc-400 hover:border-accent-dim"
          title="Sıfırla"
        >
          ⟲
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/60 text-xs text-zinc-500">
          Harita yükleniyor…
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={viewToString(view)}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        preserveAspectRatio="xMidYMid meet"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        aria-hidden={loading}
      >
        <defs>
          <linearGradient id="map-ocean" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
        </defs>

        <rect
          x={DEFAULT_MAP_VIEW.x}
          y={DEFAULT_MAP_VIEW.y}
          width={DEFAULT_MAP_VIEW.w}
          height={DEFAULT_MAP_VIEW.h}
          fill="url(#map-ocean)"
        />

        {shapes.map((shape) => {
          const result = resultBySvgId.get(shape.svgId);
          const selected = result && selectedCode === result.compatibility.countryCode;
          const intensity = result ? result.compatibility.affinity / maxAffinity : 0;
          const interactive = Boolean(result);

          return (
            <g
              key={shape.svgId}
              data-country={shape.svgId}
              style={{ cursor: interactive ? "pointer" : "default" }}
              onPointerDown={(e) => {
                if (interactive) e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleCountryClick(shape.svgId);
              }}
              aria-hidden={!interactive}
            >
              {shape.paths.map((path, i) => (
                <path
                  key={`${shape.svgId}-${i}`}
                  d={path.d}
                  style={{
                    fill: result
                      ? affinityFill(intensity, Boolean(selected))
                      : "#27272a",
                    stroke: selected ? "var(--accent)" : "#52525b",
                    strokeWidth: selected ? 0.45 : 0.12,
                    opacity: result ? 0.95 : 0.55,
                  }}
                  className={interactive ? "transition-[fill,stroke,opacity] duration-200 hover:opacity-100" : undefined}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
