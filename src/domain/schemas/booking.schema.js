import { z } from 'zod';

export const BookingStatusEnum = z.enum(['pending', 'confirmed', 'cancelled']);

export const BookingCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const BookingSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  seats: z.number().int().positive(),
  status: BookingStatusEnum,
  customer: BookingCustomerSchema,
  notes: z.string().max(1000).default(''),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const BookingCreateSchema = BookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}).extend({
  seats: z.coerce.number().int().positive(),
  status: BookingStatusEnum.default('pending'),
});
