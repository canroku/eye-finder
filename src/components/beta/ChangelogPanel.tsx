import { CHANGELOG } from "@/lib/version";

export function ChangelogPanel() {
  return (
    <div className="space-y-4">
      {CHANGELOG.map((entry) => (
        <div key={entry.version} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white">
              v{entry.version} — {entry.title}
            </h3>
            <span className="text-[10px] text-zinc-500">{entry.date}</span>
          </div>
          <ul className="space-y-1.5 text-sm text-zinc-400">
            {entry.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-accent">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
