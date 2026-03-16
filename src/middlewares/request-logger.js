import { logger } from '../infrastructure/logger.js';
import { getRequestContext } from '../infrastructure/request-context.js';

export function requestLogger(req, res, next) {
  const startContext = getRequestContext();
  logger.info('Incoming request', {
    requestId: startContext.requestId,
    method: req.method,
    path: req.originalUrl ?? req.url,
  });

  res.on('finish', () => {
    const finishContext = getRequestContext();
    const requestId = finishContext.requestId ?? startContext.requestId;
    const durationMs =
      finishContext.durationMs ??
      (finishContext.startTime
        ? Number(process.hrtime.bigint() - finishContext.startTime) / 1_000_000
        : undefined);

    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl ?? req.url,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}
