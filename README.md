# Venue Booking API

Stadium and auditorium booking service built with Node.js and Express. The project demonstrates modular architecture, strong validation, request tracing, and developer-friendly documentation.

## Features
- **Domain-driven structure**: venues, events, bookings, and health modules with shared schemas under `src/domain`.
- **Mock datastore**: file-backed JSON database seeded with sample data; can be swapped for a real datastore later.
- **Request tracing & logging**: async request context, structured logging, and consistent response envelopes (with `requestId`).
- **Robust validation**: Zod schemas at the edge (`validate-resource` middleware) plus business rules (capacity checks, conflict detection).
- **Comprehensive docs**: OpenAPI 3.1 spec (`docs/openapi.yaml`) served via Swagger UI at `/v1/docs`.
- **Testing**: Node’s built-in test runner exercises booking and event services.

## Getting Started

### Prerequisites
- Node.js 24.x (LTS) recommended
- npm 10.x (ships with Node 24)

### Install & Run
```bash
npm install
npm run dev
```
The API listens on `http://localhost:3000`. Key endpoints:
- Health probe: `GET /v1/health`
- Swagger UI: `GET /v1/docs`
- Raw OpenAPI: `GET /v1/docs/openapi.yaml`

### Environment Configuration
Environment variables are validated in `src/config/env.js`. Common settings:

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `LOG_LEVEL` | Log verbosity | `info` |
| `EXTERNAL_API_BASE_URL` | Upstream dependency used by health check | `https://jsonplaceholder.typicode.com` |
| `BOOKING_DB_PATH` | Override path for JSON datastore (handy for tests) | `${projectRoot}/data/booking-db.json` |

Create a `.env` file if you need overrides:
```bash
cp .env.example .env # create one if desired
```

## Project Structure
```
src/
  app.js                    # Express app wiring
  config/                   # Environment parsing
  controllers/              # HTTP controllers returning API envelopes
  db/                       # Mock database utilities
  domain/                   # Zod schemas and enums
  infrastructure/           # Logger and request context
  middlewares/              # Request context, logging, validation, error handling
  modules/                  # Input mappers per domain
  presenters/               # Response helpers
  repositories/             # Data access layer
  routes/                   # Express routers
  services/                 # Business logic
docs/
  API.md                    # High-level documentation
  openapi.yaml              # Generated OpenAPI specification
tests/
  booking.service.test.js   # Booking service scenarios
  event.service.test.js     # Event scheduling scenarios
```

## Working with the API
- Responses: `{"data": ..., "meta": {...?}, "requestId": "..." }`
- Errors: `{"error": "message", "details": {...?}, "requestId": "..." }`
- Request IDs are propagated via `X-Request-Id` header; generated automatically if missing.

### Example Requests
Create a venue:
```bash
curl -X POST http://localhost:3000/v1/venues \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City Sports Arena",
    "type": "arena",
    "capacity": 12000,
    "location": {
      "addressLine1": "Outer Ring Road",
      "city": "Hyderabad",
      "state": "Telangana",
      "country": "IN",
      "postalCode": "500081"
    },
    "features": ["indoor", "vip-boxes"]
  }'
```

Schedule an event:
```bash
curl -X POST http://localhost:3000/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "venueId": "<venue-id>",
    "name": "Tech Summit 2026",
    "startTime": "2026-07-10T04:00:00.000Z",
    "endTime": "2026-07-10T10:00:00.000Z",
    "tags": ["technology", "conference"]
  }'
```

Create a booking (capacity-checked):
```bash
curl -X POST http://localhost:3000/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "<event-id>",
    "seats": 4,
    "customer": { "name": "Aditi Rao", "email": "aditi@example.com" }
  }'
```

## Testing
Run the service tests:
```bash
npm test
```
The suite uses a temporary datastore by setting `BOOKING_DB_PATH` to a per-test temp file.

## Extending the Project
- Swap the mock datastore (`src/db/mock-database.js`) for a real database by re-implementing repositories.
- Add more OpenAPI detail (schemas/examples) and hook a linter like Spectral in CI.
- Expand the test suite with integration-level HTTP tests (e.g., using `supertest`).
