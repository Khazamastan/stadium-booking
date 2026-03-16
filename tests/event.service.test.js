import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'venue-booking-events-'));
const dbPath = path.join(tmpDir, 'db.json');
process.env.BOOKING_DB_PATH = dbPath;

const { writeDatabase, readDatabase } = await import('../src/db/mock-database.js');
const { scheduleEvent } = await import('../src/services/event.service.js');

const baseVenue = {
  id: 'venue-main',
  slug: 'venue-main',
  name: 'Main Convention Hall',
  type: 'auditorium',
  capacity: 500,
  location: {
    addressLine1: '123 Residency Rd',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'IN',
    postalCode: '560025',
  },
  features: ['indoor', 'projector'],
  isIndoor: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const baseMeta = {
  schemaVersion: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(async () => {
  await writeDatabase({
    meta: baseMeta,
    venues: [baseVenue],
    events: [],
    bookings: [],
  });
});

after(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

test('scheduleEvent stores a new event when slot is available', async () => {
  const payload = {
    venueId: baseVenue.id,
    name: 'Tech Summit 2026',
    description: 'Annual technology leadership summit.',
    startTime: '2026-05-10T04:00:00.000Z',
    endTime: '2026-05-10T10:00:00.000Z',
    status: 'scheduled',
    tags: ['technology'],
  };

  const created = await scheduleEvent(payload);
  assert.ok(created.id, 'event id should be generated');
  assert.equal(created.venueId, baseVenue.id);
  assert.equal(created.name, payload.name);
  assert.equal(created.status, 'scheduled');

  const db = await readDatabase();
  assert.equal(db.events.length, 1);
  assert.equal(db.events[0].name, payload.name);
});

test('scheduleEvent rejects overlapping events for the same venue', async () => {
  await writeDatabase({
    meta: baseMeta,
    venues: [baseVenue],
    events: [
      {
        id: 'event-existing',
        venueId: baseVenue.id,
        slug: 'existing-event',
        name: 'Morning Yoga',
        description: 'Sunrise wellness session.',
        startTime: '2026-05-10T04:00:00.000Z',
        endTime: '2026-05-10T06:00:00.000Z',
        status: 'scheduled',
        tags: ['wellness'],
        createdAt: '2026-01-15T00:00:00.000Z',
      },
    ],
    bookings: [],
  });

  await assert.rejects(
    scheduleEvent({
      venueId: baseVenue.id,
      name: 'Breakfast Keynote',
      startTime: '2026-05-10T05:30:00.000Z',
      endTime: '2026-05-10T07:30:00.000Z',
      status: 'scheduled',
      tags: ['conference'],
    }),
    (error) => {
      assert.equal(error.name, 'BadRequestError');
      assert.match(error.message, /already has an event/i);
      return true;
    },
  );
});
