import { z } from 'zod';
import { BadRequestError, NotFoundError } from '../errors/http-error.js';
import { createBooking, getBookingById, listBookings, updateBooking } from '../repositories/booking.repository.js';
import { getEventById } from '../repositories/event.repository.js';
import { getVenueById } from '../repositories/venue.repository.js';
import { BookingStatusEnum } from '../domain/index.js';

const ListBookingsSchema = z
  .object({
    eventId: z.string().min(1).optional(),
    status: z.enum(BookingStatusEnum.options).optional(),
  })
  .optional();

export async function getBookings(filter) {
  const parsed = ListBookingsSchema.safeParse(filter);
  if (!parsed.success) {
    throw new BadRequestError('Invalid booking query filters', parsed.error.flatten());
  }
  return listBookings(parsed.data ?? {});
}

export async function getBookingOrThrow(id) {
  const booking = await getBookingById(id);
  if (!booking) {
    throw new NotFoundError('Booking', { id });
  }
  return booking;
}

export async function createNewBooking(input) {
  const { eventId, seats } = input;
  const event = await getEventById(eventId);
  if (!event) {
    throw new NotFoundError('Event', { id: eventId });
  }

  const venue = await getVenueById(event.venueId);
  if (!venue) {
    throw new NotFoundError('Venue', { id: event.venueId });
  }

  const existingBookings = await listBookings({ eventId });
  const seatsTaken = existingBookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((total, booking) => total + booking.seats, 0);

  if (seatsTaken + seats > venue.capacity) {
    throw new BadRequestError('Not enough seats available for this booking', {
      seatsRequested: seats,
      seatsAvailable: Math.max(venue.capacity - seatsTaken, 0),
    });
  }

  return createBooking({
    ...input,
    status: 'confirmed',
  });
}

export async function cancelBooking(id) {
  const booking = await getBookingById(id);
  if (!booking) {
    throw new NotFoundError('Booking', { id });
  }

  if (booking.status === 'cancelled') {
    return booking;
  }

  const updated = await updateBooking(id, { status: 'cancelled' });
  if (!updated) {
    throw new NotFoundError('Booking', { id });
  }
  return updated;
}
