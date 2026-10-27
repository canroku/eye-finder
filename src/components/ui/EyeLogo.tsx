export function EyeLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="eye-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8585" />
          <stop offset="100%" stopColor="#ff6b6b" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" stroke="rgba(255,107,107,0.25)" strokeWidth="1.5" />
      <ellipse cx="20" cy="20" rx="10" ry="6" stroke="url(#eye-grad)" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="3.5" fill="url(#eye-grad)" />
      <circle cx="21.5" cy="18.5" r="1" fill="white" opacity="0.95" />
    </svg>
  );
}

export function EyeLogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";
  const icon = size === "lg" ? "h-9 w-9" : size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const px = size === "lg" ? 36 : size === "sm" ? 24 : 32;

  return (
    <div className={`flex items-center gap-2.5 ${text}`}>
      <svg
        viewBox="0 0 40 40"
        width={px}
        height={px}
        className={`shrink-0 ${icon}`}
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="eye-grad-mark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff8585" />
            <stop offset="100%" stopColor="#ff6b6b" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" stroke="rgba(255,107,107,0.25)" strokeWidth="1.5" />
        <ellipse cx="20" cy="20" rx="10" ry="6" stroke="url(#eye-grad-mark)" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="3.5" fill="url(#eye-grad-mark)" />
        <circle cx="21.5" cy="18.5" r="1" fill="white" opacity="0.95" />
      </svg>
      <span className="font-bold tracking-tight text-white">
        Eye <span className="gradient-text">Finder</span>
      </span>
    </div>
  );
}
