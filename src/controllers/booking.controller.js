import { cancelBooking, createNewBooking, getBookingOrThrow, getBookings } from '../services/booking.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../presenters/api-response.js';

export const listBookings = asyncHandler(async (req, res) => {
  const bookings = await getBookings({
    eventId: req.query.eventId,
    status: req.query.status,
  });
  sendSuccess(res, bookings, { total: bookings.length });
});

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await createNewBooking(req.body);
  res.status(201);
  sendSuccess(res, booking);
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await getBookingOrThrow(req.params.bookingId);
  sendSuccess(res, booking);
});

export const cancelBookingRoute = asyncHandler(async (req, res) => {
  const booking = await cancelBooking(req.params.bookingId);
  sendSuccess(res, booking);
});
