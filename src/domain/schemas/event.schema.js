import { z } from 'zod';

export const EventStatusEnum = z.enum(['draft', 'scheduled', 'completed', 'cancelled']);

export const EventSchema = z.object({
  id: z.string().min(1),
  venueId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().max(1000).default(''),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: EventStatusEnum,
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const EventCreateSchema = EventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}).extend({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: EventStatusEnum.default('scheduled'),
  slug: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().max(1000).optional(),
});
