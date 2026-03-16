import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'venue-booking-bookings-'));
const dbPath = path.join(tmpDir, 'db.json');
process.env.BOOKING_DB_PATH = dbPath;

const { writeDatabase, readDatabase } = await import('../src/db/mock-database.js');
const { createNewBooking, cancelBooking } = await import('../src/services/booking.service.js');

const baseMeta = {
  schemaVersion: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const baseVenue = {
  id: 'venue-main',
  slug: 'venue-main',
  name: 'Main Convention Hall',
  type: 'auditorium',
  capacity: 10,
  location: {
    addressLine1: '123 Residency Rd',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'IN',
    postalCode: '560025',
  },
  features: ['indoor'],
  isIndoor: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const baseEvent = {
  id: 'event-main',
  venueId: baseVenue.id,
  slug: 'event-main',
  name: 'Leadership Summit',
  description: 'Day long summit',
  startTime: '2026-06-01T04:00:00.000Z',
  endTime: '2026-06-01T10:00:00.000Z',
  status: 'scheduled',
  tags: ['conference'],
  createdAt: '2026-02-01T00:00:00.000Z',
};

beforeEach(async () => {
  await writeDatabase({
    meta: baseMeta,
    venues: [baseVenue],
    events: [baseEvent],
    bookings: [],
  });
});

after(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

test('createNewBooking persists booking and consumes capacity', async () => {
  const booking = await createNewBooking({
    eventId: baseEvent.id,
    seats: 4,
    customer: { name: 'Aditi Rao', email: 'aditi@example.com' },
    notes: 'Need wheelchair access',
  });

  assert.ok(booking.id);
  assert.equal(booking.eventId, baseEvent.id);
  assert.equal(booking.seats, 4);
  assert.equal(booking.status, 'confirmed');

  const db = await readDatabase();
  assert.equal(db.bookings.length, 1);
  assert.equal(db.bookings[0].customer.name, 'Aditi Rao');
});

test('createNewBooking rejects when capacity exhausted', async () => {
  await writeDatabase({
    meta: baseMeta,
    venues: [baseVenue],
    events: [baseEvent],
    bookings: [
      {
        id: 'booking-existing',
        eventId: baseEvent.id,
        seats: 8,
        status: 'confirmed',
        customer: { name: 'Existing Customer' },
        notes: '',
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ],
  });

  await assert.rejects(
    createNewBooking({
      eventId: baseEvent.id,
      seats: 4,
      customer: { name: 'Ravi Kumar' },
    }),
    (error) => {
      assert.equal(error.name, 'BadRequestError');
      assert.equal(error.details.seatsAvailable, 2);
      return true;
    },
  );
});

test('cancelBooking marks the booking as cancelled', async () => {
  await writeDatabase({
    meta: baseMeta,
    venues: [baseVenue],
    events: [baseEvent],
    bookings: [
      {
        id: 'booking-cancel',
        eventId: baseEvent.id,
        seats: 2,
        status: 'confirmed',
        customer: { name: 'Neha Singh' },
        notes: '',
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ],
  });

  const updated = await cancelBooking('booking-cancel');
  assert.equal(updated.status, 'cancelled');

  const db = await readDatabase();
  assert.equal(db.bookings[0].status, 'cancelled');
});
