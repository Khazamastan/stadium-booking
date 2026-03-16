import { getAppStatus } from '../services/health.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../presenters/api-response.js';

export const getHealth = asyncHandler(async (req, res) => {
  const status = await getAppStatus();
  sendSuccess(res, status);
});
