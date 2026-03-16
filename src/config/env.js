import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default(process.env.NODE_ENV ?? 'development'),
  APP_NAME: z.string().min(1).default('venue-booking-service'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  EXTERNAL_API_BASE_URL: z.string().url().default('https://jsonplaceholder.typicode.com'),
});

export const env = EnvSchema.parse(process.env);
