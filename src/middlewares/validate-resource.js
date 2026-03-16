import { BadRequestError } from '../errors/http-error.js';

export function validateResource(schema, { source = 'body', transform } = {}) {
  return (req, res, next) => {
    try {
      const rawValue = req[source];
      const prepared = transform ? transform(rawValue, req) : rawValue;
      const result = schema.safeParse(prepared);

      if (!result.success) {
        throw new BadRequestError('Validation failed', result.error.flatten());
      }

      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateBody(schema, options = {}) {
  return validateResource(schema, { ...options, source: 'body' });
}

export function validateQuery(schema, options = {}) {
  return validateResource(schema, { ...options, source: 'query' });
}

