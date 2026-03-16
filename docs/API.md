# Venue Booking API Documentation

## Overview
- RESTful service for managing venues, events, and bookings across stadiums and auditoriums.
- Every response is wrapped in a standard envelope: `{"data": ..., "meta": {...?}, "requestId": "..."}`.
- Errors follow `{"error": "message", "details": {...?}, "requestId": "..."}` to simplify tracing with logs.

## Getting Started
- Install dependencies: `npm install`
- Run the API: `npm run dev`
- Default base URL: `http://localhost:3000/v1`
- Health check: `GET /v1/health`
- Swagger UI: `http://localhost:3000/v1/docs`

## Key Resources
- Venues (`/v1/venues`)
  - `GET` list venues
  - `POST` create venue (requires `name`, `capacity`, `location`)
  - `GET /v1/venues/{venueId}` fetch single venue
- Events (`/v1/events`)
  - `GET` optional `venueId`, `status` filters
  - `POST` schedule event (conflict detection ensures no overlap at the same venue)
  - `GET /v1/events/{eventId}` fetch event
- Bookings (`/v1/bookings`)
  - `GET` optional `eventId`, `status` filters
  - `POST` create booking (capacity validation enforced)
  - `PATCH /v1/bookings/{bookingId}/cancel` mark booking as cancelled

## Documentation & Tooling
- Comprehensive OpenAPI spec lives at `docs/openapi.yaml` and is served at `/v1/docs/openapi.yaml`
- Swagger UI is served from `/v1/docs`
- Update the spec whenever endpoints or response shapes change; CI can lint with tools like `spectral`

## Configuration
- All environment variables validated in `src/config/env.js`
  - `PORT` (default `3000`)
  - `NODE_ENV` (`development` | `test` | `production`)
  - `LOG_LEVEL` (trace|debug|info|warn|error|fatal)
  - `EXTERNAL_API_BASE_URL`
  - `BOOKING_DB_PATH` (optional override for mock database storage; used in tests)

## Testing
- Unit & integration tests live under `tests/`
- Run: `npm test` (invokes Node’s built-in test runner)
- Tests isolate datastore state by using `BOOKING_DB_PATH` pointing at a temp file
- Extend coverage by adding more cases around controllers or repositories as the service grows

## Operational Notes
- Structured logs include `requestId`, HTTP metadata, and error stacks in development
- Request context middleware provides distributed tracing hooks for future expansion (APM, correlation IDs)
- Replace the mock JSON database with a production datastore by swapping repository implementations; the service layer remains unchanged
