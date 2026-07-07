/**
 * Development-only structured logger. In production these are no-ops so
 * that user-facing logs stay quiet and the Worker log stream is not noisy.
 * Server-side `process.env.NODE_ENV` and browser `import.meta.env.DEV` are
 * both consulted so the same helper is safe on either side.
 */
type Level = "debug" | "info" | "warn" | "error";

function isDev(): boolean {
  // Vite exposes DEV in the browser bundle
  if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
    return true;
  }
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    return true;
  }
  return false;
}

function emit(level: Level, scope: string, message: string, meta?: unknown) {
  if (!isDev() && level !== "error") return;
  const tag = `[${scope}]`;
  const args = meta === undefined ? [tag, message] : [tag, message, meta];

  console[level](...args);
}

export function createLogger(scope: string) {
  return {
    debug: (message: string, meta?: unknown) => emit("debug", scope, message, meta),
    info: (message: string, meta?: unknown) => emit("info", scope, message, meta),
    warn: (message: string, meta?: unknown) => emit("warn", scope, message, meta),
    error: (message: string, meta?: unknown) => emit("error", scope, message, meta),
  };
}

export type Logger = ReturnType<typeof createLogger>;
