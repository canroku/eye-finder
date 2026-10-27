export class TimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} zaman aşımı (${Math.round(ms / 1000)}s)`);
    this.name = "TimeoutError";
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new TimeoutError(label, ms)), ms);
    }),
  ]);
}
