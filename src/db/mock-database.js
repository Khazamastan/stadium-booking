import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VenueSchema,
  EventSchema,
  BookingSchema,
  BookingStatusEnum,
  EventStatusEnum,
} from '../domain/index.js';
import { slugify } from '../utils/slugify.js';

const CURRENT_SCHEMA_VERSION = 1;
const ISO_NOW = () => new Date().toISOString();

const DEFAULT_DATA = {
  meta: {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  venues: [
    {
      id: 'venue-eden-gardens',
      slug: 'eden-gardens-stadium',
      name: 'Eden Gardens Stadium',
      type: 'stadium',
      capacity: 68000,
      location: {
        addressLine1: 'Maidan, BBD Bagh',
        city: 'Kolkata',
        state: 'West Bengal',
        country: 'IN',
        postalCode: '700021',
      },
      features: ['outdoor', 'night-lighting', 'corporate-boxes'],
      isIndoor: false,
      createdAt: '2026-01-02T06:30:00.000Z',
    },
    {
      id: 'venue-nimhans-auditorium',
      slug: 'nimhans-convention-centre',
      name: 'NIMHANS Convention Centre',
      type: 'auditorium',
      capacity: 1000,
      location: {
        addressLine1: 'Hosur Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'IN',
        postalCode: '560029',
      },
      features: ['indoor', 'acoustics', 'vip-lounge'],
      isIndoor: true,
      createdAt: '2026-01-05T10:00:00.000Z',
    },
  ],
  events: [
    {
      id: 'event-ipl-qualifier',
      venueId: 'venue-eden-gardens',
      slug: 'ipl-qualifier-2026',
      name: 'IPL Qualifier 1',
      startTime: '2026-04-01T14:00:00.000Z',
      endTime: '2026-04-01T18:00:00.000Z',
      description: 'Cricket semifinal clash under lights.',
      status: 'scheduled',
      tags: ['cricket', 'sports'],
      createdAt: '2026-02-01T09:00:00.000Z',
    },
    {
      id: 'event-tech-conclave',
      venueId: 'venue-nimhans-auditorium',
      slug: 'tech-leadership-conclave-2026',
      name: 'Tech Leadership Conclave',
      startTime: '2026-03-25T04:30:00.000Z',
      endTime: '2026-03-25T12:30:00.000Z',
      description: 'Day-long technology conference and panels.',
      status: 'scheduled',
      tags: ['technology', 'conference'],
      createdAt: '2026-02-15T07:15:00.000Z',
    },
  ],
  bookings: [],
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CUSTOM_DB_PATH = process.env.BOOKING_DB_PATH ? path.resolve(process.env.BOOKING_DB_PATH) : null;
const DEFAULT_DATA_DIR = path.join(__dirname, '../../data');
const DATA_DIR = CUSTOM_DB_PATH ? path.dirname(CUSTOM_DB_PATH) : DEFAULT_DATA_DIR;
const DB_PATH = CUSTOM_DB_PATH ?? path.join(DATA_DIR, 'booking-db.json');

async function ensureDatabaseFile() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DB_PATH)) {
    await writeFile(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8');
  }
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function toIsoDate(value, fallback) {
  if (!value) return fallback ?? ISO_NOW();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback ?? ISO_NOW() : date.toISOString();
}

function normalizeVenue(raw) {
  const location = (() => {
    if (!raw.location) {
      return {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      };
    }
    if (typeof raw.location === 'string') {
      const [city = '', country = ''] = raw.location.split(',').map((part) => part.trim());
      return {
        addressLine1: '',
        addressLine2: '',
        city,
        state: '',
        country,
        postalCode: '',
      };
    }
    return {
      addressLine1: raw.location.addressLine1 ?? '',
      addressLine2: raw.location.addressLine2 ?? '',
      city: raw.location.city ?? raw.location?.split?.(',')?.[0] ?? '',
      state: raw.location.state ?? '',
      country: raw.location.country ?? '',
      postalCode: raw.location.postalCode ?? '',
    };
  })();

  const normalized = {
    id: raw.id ?? slugify(raw.name ?? 'venue'),
    slug: raw.slug ?? slugify(raw.name ?? raw.id ?? 'venue'),
    name: raw.name ?? 'Unnamed Venue',
    type: raw.type ?? 'stadium',
    capacity: Number(raw.capacity ?? 0),
    location,
    features: Array.isArray(raw.features) ? raw.features : [],
    isIndoor:
      typeof raw.isIndoor === 'boolean'
        ? raw.isIndoor
        : ['auditorium', 'conference-hall', 'theatre'].includes(raw.type),
    createdAt: toIsoDate(raw.createdAt),
    updatedAt: raw.updatedAt ? toIsoDate(raw.updatedAt) : undefined,
  };

  const parsed = VenueSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new Error(`Invalid venue data detected in datastore: ${parsed.error.message}`);
  }
  return parsed.data;
}

function normalizeEvent(raw) {
  const normalized = {
    id: raw.id ?? slugify(`event-${raw.name ?? ISO_NOW()}`),
    venueId: raw.venueId ?? '',
    slug: raw.slug ?? slugify(raw.name ?? raw.id ?? 'event'),
    name: raw.name ?? 'Untitled Event',
    description: raw.description ?? '',
    startTime: toIsoDate(raw.startTime),
    endTime: toIsoDate(raw.endTime),
    status: EventStatusEnum.options.includes(raw.status) ? raw.status : 'scheduled',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    createdAt: toIsoDate(raw.createdAt),
    updatedAt: raw.updatedAt ? toIsoDate(raw.updatedAt) : undefined,
  };

  const parsed = EventSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new Error(`Invalid event data detected in datastore: ${parsed.error.message}`);
  }
  return parsed.data;
}

function normalizeBooking(raw) {
  const customer = raw.customer ?? {
    name: raw.customerName ?? raw.name ?? 'Guest',
    email: raw.customerEmail,
    phone: raw.customerPhone,
  };

  const normalized = {
    id: raw.id ?? slugify(`booking-${ISO_NOW()}`),
    eventId: raw.eventId ?? '',
    seats: Number(raw.seats ?? 0),
    status: BookingStatusEnum.options.includes(raw.status) ? raw.status : 'confirmed',
    customer: {
      name: customer.name ?? 'Guest',
      email: customer.email,
      phone: customer.phone,
    },
    notes: raw.notes ?? '',
    createdAt: toIsoDate(raw.createdAt),
    updatedAt: raw.updatedAt ? toIsoDate(raw.updatedAt) : undefined,
  };

  const parsed = BookingSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new Error(`Invalid booking data detected in datastore: ${parsed.error.message}`);
  }
  return parsed.data;
}

function normalizeMeta(meta = {}) {
  const createdAt = meta.createdAt ? toIsoDate(meta.createdAt) : ISO_NOW();
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt,
    updatedAt: ISO_NOW(),
  };
}

function normalizeDatabase(raw = {}) {
  const data = clone(raw);
  const venues = Array.isArray(data.venues) ? data.venues.map(normalizeVenue) : [];
  const events = Array.isArray(data.events) ? data.events.map(normalizeEvent) : [];
  const bookings = Array.isArray(data.bookings) ? data.bookings.map(normalizeBooking) : [];

  return {
    meta: normalizeMeta(data.meta),
    venues,
    events,
    bookings,
  };
}

export async function readDatabase() {
  await ensureDatabaseFile();
  const raw = await readFile(DB_PATH, 'utf8');
  return normalizeDatabase(JSON.parse(raw));
}

export async function writeDatabase(data) {
  await ensureDatabaseFile();
  const normalized = normalizeDatabase(data);
  await writeFile(DB_PATH, JSON.stringify(normalized, null, 2), 'utf8');
}

export async function updateDatabase(mutator) {
  const current = await readDatabase();
  const workingCopy = clone(current);
  const maybeNewData = await mutator(workingCopy);
  const nextData = maybeNewData ? maybeNewData : workingCopy;
  await writeDatabase(nextData);
  return nextData;
}
