import { randomUUID } from 'node:crypto';
import { readDatabase, updateDatabase } from '../db/mock-database.js';
import { EventSchema } from '../domain/index.js';
import { slugify } from '../utils/slugify.js';

export async function listEvents(filter = {}) {
  const db = await readDatabase();
  const { venueId, status } = filter;
  return db.events.filter((event) => {
    if (venueId && event.venueId !== venueId) {
      return false;
    }
    if (status && event.status !== status) {
      return false;
    }
    return true;
  });
}

export async function getEventById(id) {
  const db = await readDatabase();
  return db.events.find((event) => event.id === id) ?? null;
}

export async function getEventBySlug(slug) {
  const db = await readDatabase();
  return db.events.find((event) => event.slug === slug) ?? null;
}

export async function createEvent(data) {
  const now = new Date().toISOString();
  const eventCandidate = {
    ...data,
    id: randomUUID(),
    slug: data.slug ?? slugify(`${data.name}-${now}`),
    startTime: data.startTime,
    endTime: data.endTime,
    tags: data.tags ?? [],
    createdAt: now,
  };

  const event = EventSchema.parse(eventCandidate);

  await updateDatabase((db) => {
    if (db.events.some((existing) => existing.slug === event.slug)) {
      const error = new Error(`Event with slug "${event.slug}" already exists`);
      error.code = 'EVENT_DUPLICATE_SLUG';
      throw error;
    }
    db.events.push(event);
  });

  return event;
}

