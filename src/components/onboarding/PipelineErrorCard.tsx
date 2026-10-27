"use client";

interface Props {
  message: string;
  onRetry?: () => void;
  onReset?: () => void;
}

export function PipelineErrorCard({ message, onRetry, onReset }: Props) {
  return (
    <div
      role="alert"
      className="glass-card mb-4 border-red-900/50 p-5"
    >
      <p className="text-sm font-medium text-red-300">Analiz tamamlanamadı</p>
      <p className="mt-2 text-sm text-zinc-400">{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary text-sm">
            Tekrar Dene
          </button>
        )}
        {onReset && (
          <button type="button" onClick={onReset} className="btn-secondary text-sm">
            Ayarlara Git
          </button>
        )}
      </div>
    </div>
  );
}
