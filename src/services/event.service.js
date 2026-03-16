import { z } from 'zod';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/http-error.js';
import { getEventById, listEvents, createEvent } from '../repositories/event.repository.js';
import { getVenueById } from '../repositories/venue.repository.js';
import { EventStatusEnum } from '../domain/index.js';

const ListEventsSchema = z
  .object({
    venueId: z.string().min(1).optional(),
    status: z.enum(EventStatusEnum.options).optional(),
  })
  .optional();

export async function getEvents(filter) {
  const parsed = ListEventsSchema.parse(filter);
  return listEvents(parsed ?? {});
}

export async function getEventOrThrow(id) {
  const event = await getEventById(id);
  if (!event) {
    throw new NotFoundError('Event', { id });
  }
  return event;
}

export async function scheduleEvent(input) {
  const { venueId, startTime, endTime } = input;
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  const end = endTime instanceof Date ? endTime : new Date(endTime);

  if (start >= end) {
    throw new BadRequestError('Event endTime must be after startTime');
  }

  const venue = await getVenueById(venueId);
  if (!venue) {
    throw new NotFoundError('Venue', { id: venueId });
  }

  const existing = await listEvents({ venueId });
  const hasOverlap = existing
    .filter((event) => event.status !== 'cancelled')
    .some((event) => {
      const existingStart = new Date(event.startTime);
      const existingEnd = new Date(event.endTime);
      return start < existingEnd && end > existingStart;
    });

  if (hasOverlap) {
    throw new BadRequestError('Venue already has an event scheduled in the requested time window');
  }

  try {
    return await createEvent({
      ...input,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  } catch (error) {
    if (error.code === 'EVENT_DUPLICATE_SLUG') {
      throw new ConflictError('Event with the same slug already exists', { slug: input.slug });
    }
    throw error;
  }
}
