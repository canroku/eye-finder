"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  "aria-label"?: string;
}

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Seçin",
  searchPlaceholder = "Ara…",
  className = "",
  "aria-label": ariaLabel,
}: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={fieldId}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="input flex w-full items-center justify-between gap-2 py-2.5 text-left text-sm"
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selected?.icon && <span className="shrink-0 text-lg">{selected.icon}</span>}
          <span className="truncate text-white">{selected?.label ?? placeholder}</span>
        </span>
        <span
          className={`shrink-0 text-[10px] text-zinc-500 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-violet-500/25 bg-[#141018] shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
          <div className="border-b border-zinc-800/80 p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="input py-2 text-sm"
            />
          </div>

          <ul
            role="listbox"
            aria-labelledby={fieldId}
            className="max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-zinc-500">Sonuç bulunamadı</li>
            )}
            {filtered.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => pick(opt.value)}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-violet-500/20 text-white"
                        : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                    }`}
                  >
                    {opt.icon && <span className="shrink-0 text-lg">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
