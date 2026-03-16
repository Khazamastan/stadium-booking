import { logger } from '../infrastructure/logger.js';
import { getRequestContext } from '../infrastructure/request-context.js';

export function errorHandler(err, req, res, _next) {
  const context = getRequestContext();
  logger.error('Request failed', {
    requestId: context.requestId,
    method: req.method,
    path: req.originalUrl ?? req.url,
    statusCode: err.status ?? 500,
    error: err,
  });

  if (err?.status) {
    const payload = {
      error: err.message,
      details: err.details,
      requestId: context.requestId,
    };
    if (!payload.details) {
      delete payload.details;
    }
    res.status(err.status).json(payload);
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    requestId: context.requestId,
  });
}
