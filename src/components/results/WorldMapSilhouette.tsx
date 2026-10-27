import { withBasePath } from "@/lib/api";

/** Gerçek dünya silueti — flekschas/simple-world-map (CC BY-SA 3.0) */
export function WorldMapSilhouette({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-zinc-950" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBasePath("/maps/world-outline.svg")}
        alt=""
        aria-hidden
        className="relative h-full w-full object-contain opacity-80 [filter:brightness(0.45)_contrast(1.2)_saturate(0.2)]"
      />
    </div>
  );
}
