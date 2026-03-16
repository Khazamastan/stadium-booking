import { env } from '../config/env.js';
import { getRequestContext } from './request-context.js';

const LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
const levelThreshold = LEVELS.indexOf(env.LOG_LEVEL);

function shouldLog(level) {
  const idx = LEVELS.indexOf(level);
  return idx >= levelThreshold;
}

function serializeError(err) {
  if (!err) {
    return undefined;
  }
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    };
  }
  return err;
}

function baseLog(level, message, metadata) {
  if (!shouldLog(level)) {
    return;
  }

  const context = getRequestContext();
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    app: env.APP_NAME,
    ...context,
    ...metadata,
  };

  const serialized = JSON.stringify(
    logEntry,
    (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    },
    2,
  );
  if (level === 'error' || level === 'fatal') {
    console.error(serialized);
  } else if (level === 'warn') {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

function logFactory(level) {
  return (message, metadata) => {
    const error = metadata?.error ? serializeError(metadata.error) : undefined;
    const payload = error ? { ...metadata, error } : metadata;
    baseLog(level, message, payload);
  };
}

export const logger = {
  trace: logFactory('trace'),
  debug: logFactory('debug'),
  info: logFactory('info'),
  warn: logFactory('warn'),
  error: logFactory('error'),
  fatal: logFactory('fatal'),
  child(childMeta = {}) {
    return {
      trace: (msg, meta) => logger.trace(msg, { ...childMeta, ...meta }),
      debug: (msg, meta) => logger.debug(msg, { ...childMeta, ...meta }),
      info: (msg, meta) => logger.info(msg, { ...childMeta, ...meta }),
      warn: (msg, meta) => logger.warn(msg, { ...childMeta, ...meta }),
      error: (msg, meta) => logger.error(msg, { ...childMeta, ...meta }),
      fatal: (msg, meta) => logger.fatal(msg, { ...childMeta, ...meta }),
    };
  },
};
