import { randomUUID } from 'node:crypto';
import { readDatabase, updateDatabase } from '../db/mock-database.js';
import { VenueSchema } from '../domain/index.js';
import { slugify } from '../utils/slugify.js';

export async function listVenues() {
  const db = await readDatabase();
  return db.venues;
}

export async function getVenueById(id) {
  const db = await readDatabase();
  return db.venues.find((venue) => venue.id === id) ?? null;
}

export async function getVenueBySlug(slug) {
  const db = await readDatabase();
  return db.venues.find((venue) => venue.slug === slug) ?? null;
}

export async function createVenue(data) {
  const now = new Date().toISOString();
  const venueCandidate = {
    ...data,
    id: randomUUID(),
    slug: data.slug ?? slugify(data.name),
    capacity: Number(data.capacity),
    features: data.features ?? [],
    isIndoor:
      typeof data.isIndoor === 'boolean'
        ? data.isIndoor
        : ['auditorium', 'conference-hall', 'theatre'].includes(data.type),
    createdAt: now,
  };

  const venue = VenueSchema.parse(venueCandidate);

  await updateDatabase((db) => {
    if (db.venues.some((existing) => existing.slug === venue.slug)) {
      const error = new Error(`Venue with slug "${venue.slug}" already exists`);
      error.code = 'VENUE_DUPLICATE_SLUG';
      throw error;
    }
    db.venues.push(venue);
  });

  return venue;
}

