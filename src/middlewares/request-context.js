import { randomUUID } from 'node:crypto';
import { runWithRequestContext, mergeRequestContext } from '../infrastructure/request-context.js';

export function requestContextMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] ?? randomUUID();
  const startTime = process.hrtime.bigint();

  const context = {
    requestId,
    method: req.method,
    path: req.originalUrl ?? req.url,
    startTime,
  };

  runWithRequestContext(context, () => {
    res.setHeader('x-request-id', requestId);
    res.on('finish', () => {
      const durationNs = process.hrtime.bigint() - startTime;
      mergeRequestContext({ durationMs: Number(durationNs) / 1_000_000 });
    });
    next();
  });
}

