interface GlassCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  variant?: "default" | "hero" | "soft";
}

export function GlassCard({
  title,
  subtitle,
  children,
  className = "",
  glow = false,
  variant = "default",
}: GlassCardProps) {
  const variantClass =
    variant === "hero" ? "glass-card-hero" : variant === "soft" ? "opacity-95" : "";

  return (
    <section
      className={`glass-card p-5 ${glow ? "glass-card-glow" : ""} ${variantClass} ${className}`}
    >
      {(title || subtitle) && (
        <header className="mb-4 border-b border-white/5 pb-3">
          {subtitle && <p className="section-label mb-1">{subtitle}</p>}
          {title && (
            <h3 className="text-base font-bold tracking-tight text-white">{title}</h3>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
