interface Props {
  variant?: "info" | "warning";
  children: React.ReactNode;
}

export function DisclaimerBanner({ variant = "info", children }: Props) {
  const styles =
    variant === "warning"
      ? "border-accent-dim bg-accent-dim text-accent-soft"
      : "border-zinc-700 bg-zinc-900/80 text-zinc-400";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}
