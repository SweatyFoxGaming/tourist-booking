type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function write(level: LogLevel, scope: string, message: string, context?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(context ? { context } : {}),
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case "debug":
      console.debug(line);
      break;
    case "info":
      console.info(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
  }
}

export const logger = {
  debug(scope: string, message: string, context?: LogContext) {
    write("debug", scope, message, context);
  },
  info(scope: string, message: string, context?: LogContext) {
    write("info", scope, message, context);
  },
  warn(scope: string, message: string, context?: LogContext) {
    write("warn", scope, message, context);
  },
  error(scope: string, message: string, context?: LogContext) {
    write("error", scope, message, context);
  },
};
