import { z } from 'zod';

export const VenueTypeEnum = z.enum(['stadium', 'auditorium', 'arena', 'theatre', 'conference-hall']);

export const VenueLocationSchema = z.object({
  addressLine1: z.string().default(''),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'city is required'),
  state: z.string().default(''),
  country: z.string().min(1, 'country is required'),
  postalCode: z.string().default(''),
});

export const VenueSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  type: VenueTypeEnum,
  capacity: z.number().int().positive(),
  location: VenueLocationSchema,
  features: z.array(z.string()).default([]),
  isIndoor: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const VenueCreateSchema = VenueSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  capacity: z.coerce.number().int().positive(),
  isIndoor: z.boolean().optional(),
  slug: z.string().min(1).optional(),
  features: z.array(z.string()).optional(),
});
