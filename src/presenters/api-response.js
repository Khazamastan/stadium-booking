import { getRequestContext } from '../infrastructure/request-context.js';

export function sendSuccess(res, data, meta) {
  const context = getRequestContext();
  const payload = {
    data,
    meta: meta ?? undefined,
    requestId: context.requestId,
  };
  if (!payload.meta) {
    delete payload.meta;
  }
  res.json(payload);
}

