"use client";

interface Props {
  message: string;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, title = "Bir sorun oluştu", onRetry, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
    >
      <p className="text-sm font-medium text-red-300">{title}</p>
      <p className="mt-1 text-sm text-zinc-400">{message}</p>
      {(onRetry || onDismiss) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn-primary py-2 text-xs">
              Tekrar Dene
            </button>
          )}
          {onDismiss && (
            <button type="button" onClick={onDismiss} className="btn-secondary py-2 text-xs">
              Kapat
            </button>
          )}
        </div>
      )}
    </div>
  );
}
