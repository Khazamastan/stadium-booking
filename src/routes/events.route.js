import { Router } from 'express';
import { createEvent, getEvent, listEvents } from '../controllers/event.controller.js';
import { validateBody } from '../middlewares/validate-resource.js';
import { EventCreateSchema } from '../domain/index.js';
import { toEventCreateInput } from '../modules/events/event.mapper.js';

const router = Router();

router.get('/', listEvents);
router.post('/', validateBody(EventCreateSchema, { transform: toEventCreateInput }), createEvent);
router.get('/:eventId', getEvent);

export default router;
