interface Props {
  label?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  highlight?: string;
}

export function PageHeader({
  label,
  title,
  subtitle,
  action,
  className = "",
  highlight,
}: Props) {
  return (
    <header className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {label && <p className="section-label mb-2">{label}</p>}
        <h1 className="page-title">
          {highlight ? (
            <>
              {title.replace(highlight, "").trim()}{" "}
              <span className="gradient-text">{highlight}</span>
            </>
          ) : (
            title
          )}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
