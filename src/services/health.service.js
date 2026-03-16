import { env } from '../config/env.js';

const EXTERNAL_HEALTH_URL = new URL('/posts/1', env.EXTERNAL_API_BASE_URL).toString();

export async function getAppStatus({ fetch = globalThis.fetch } = {}) {
  return {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    dependencies: await checkExternalApi(fetch),
  };
}

async function checkExternalApi(fetchImpl) {
  try {
    const res = await fetchImpl(EXTERNAL_HEALTH_URL);
    return res.ok ? 'online' : 'degraded';
  } catch {
    return 'offline';
  }
}
