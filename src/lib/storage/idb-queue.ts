/** IndexedDB işlemlerini sıraya alır — eşzamanlı yazım kilitlenmesini önler */
let chain: Promise<unknown> = Promise.resolve();

export function idbQueue<T>(operation: () => Promise<T>): Promise<T> {
  const run = chain.then(operation, operation);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function resetIdbQueue(): void {
  chain = Promise.resolve();
}
