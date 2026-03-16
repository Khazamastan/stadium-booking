import { getEventOrThrow, getEvents, scheduleEvent } from '../services/event.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../presenters/api-response.js';

export const listEvents = asyncHandler(async (req, res) => {
  const events = await getEvents({
    venueId: req.query.venueId,
    status: req.query.status,
  });
  sendSuccess(res, events, { total: events.length });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await scheduleEvent(req.body);
  res.status(201);
  sendSuccess(res, event);
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await getEventOrThrow(req.params.eventId);
  sendSuccess(res, event);
});
