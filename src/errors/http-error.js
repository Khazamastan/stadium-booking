export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

export class NotFoundError extends HttpError {
  constructor(resource, details) {
    super(404, `${resource} not found`, details);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends HttpError {
  constructor(message, details) {
    super(400, message, details);
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends HttpError {
  constructor(message, details) {
    super(409, message, details);
    this.name = 'ConflictError';
  }
}

