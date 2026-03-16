import { Router } from 'express';
import { createVenue, getVenue, listVenues } from '../controllers/venue.controller.js';
import { validateBody } from '../middlewares/validate-resource.js';
import { VenueCreateSchema } from '../domain/index.js';
import { toVenueCreateInput } from '../modules/venues/venue.mapper.js';

const router = Router();

router.get('/', listVenues);
router.post('/', validateBody(VenueCreateSchema, { transform: toVenueCreateInput }), createVenue);
router.get('/:venueId', getVenue);

export default router;
