import { Router } from 'express';
import { z } from 'zod';
import { cancelBookingRoute, createBooking, getBooking, listBookings } from '../controllers/booking.controller.js';
import { validateBody, validateQuery } from '../middlewares/validate-resource.js';
import { BookingCreateSchema, BookingStatusEnum } from '../domain/index.js';
import { toBookingCreateInput } from '../modules/bookings/booking.mapper.js';

const router = Router();

const BookingListQuerySchema = z.object({
  eventId: z.string().min(1).optional(),
  status: z.enum(BookingStatusEnum.options).optional(),
});

router.get('/', validateQuery(BookingListQuerySchema), listBookings);
router.post('/', validateBody(BookingCreateSchema, { transform: toBookingCreateInput }), createBooking);
router.get('/:bookingId', getBooking);
router.patch('/:bookingId/cancel', cancelBookingRoute);

export default router;
