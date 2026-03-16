import express from 'express';
import healthRoutes from './routes/health.route.js';
import venuesRoutes from './routes/venues.route.js';
import eventsRoutes from './routes/events.route.js';
import bookingsRoutes from './routes/bookings.route.js';
import docsRoutes from './routes/docs.route.js';
import { requestContextMiddleware } from './middlewares/request-context.js';
import { requestLogger } from './middlewares/request-logger.js';
import { errorHandler } from './middlewares/error-handler.js';

const app = express();

app.use(requestContextMiddleware);
app.use(express.json());
app.use(requestLogger);

app.use('/v1', healthRoutes);
app.use('/v1/venues', venuesRoutes);
app.use('/v1/events', eventsRoutes);
app.use('/v1/bookings', bookingsRoutes);
app.use('/v1/docs', docsRoutes);

app.use(errorHandler);

export default app;
