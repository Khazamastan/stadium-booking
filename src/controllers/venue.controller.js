import { addVenue, findVenueById, getAllVenues } from '../services/venue.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../presenters/api-response.js';

export const listVenues = asyncHandler(async (req, res) => {
  const venues = await getAllVenues();
  sendSuccess(res, venues, { total: venues.length });
});

export const createVenue = asyncHandler(async (req, res) => {
  const venue = await addVenue(req.body);
  res.status(201);
  sendSuccess(res, venue);
});

export const getVenue = asyncHandler(async (req, res) => {
  const venue = await findVenueById(req.params.venueId);
  sendSuccess(res, venue);
});
