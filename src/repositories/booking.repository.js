import { randomUUID } from 'node:crypto';
import { readDatabase, updateDatabase } from '../db/mock-database.js';
import { BookingSchema } from '../domain/index.js';

export async function listBookings(filter = {}) {
  const db = await readDatabase();
  const { eventId, status } = filter;
  return db.bookings.filter((booking) => {
    if (eventId && booking.eventId !== eventId) {
      return false;
    }
    if (status && booking.status !== status) {
      return false;
    }
    return true;
  });
}

export async function getBookingById(id) {
  const db = await readDatabase();
  return db.bookings.find((booking) => booking.id === id) ?? null;
}

export async function createBooking(data) {
  const now = new Date().toISOString();
  const bookingCandidate = {
    ...data,
    status: data.status ?? 'confirmed',
    id: randomUUID(),
    createdAt: now,
  };

  const booking = BookingSchema.parse(bookingCandidate);

  await updateDatabase((db) => {
    db.bookings.push(booking);
  });

  return booking;
}

export async function updateBooking(id, updates) {
  let updatedBooking = null;
  await updateDatabase((db) => {
    const bookingIndex = db.bookings.findIndex((booking) => booking.id === id);
    if (bookingIndex === -1) {
      return;
    }
    const candidate = {
      ...db.bookings[bookingIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const parsed = BookingSchema.parse(candidate);
    db.bookings[bookingIndex] = parsed;
    updatedBooking = parsed;
  });
  return updatedBooking;
}
