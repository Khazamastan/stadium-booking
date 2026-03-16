import { ConflictError, NotFoundError } from '../errors/http-error.js';
import { createVenue, getVenueById, listVenues } from '../repositories/venue.repository.js';

export async function getAllVenues() {
  return listVenues();
}

export async function findVenueById(id) {
  const venue = await getVenueById(id);
  if (!venue) {
    throw new NotFoundError('Venue', { id });
  }
  return venue;
}

export async function addVenue(input) {
  try {
    return await createVenue(input);
  } catch (error) {
    if (error.code === 'VENUE_DUPLICATE_SLUG') {
      throw new ConflictError('Venue with the same slug already exists', { slug: input.slug });
    }
    throw error;
  }
}
