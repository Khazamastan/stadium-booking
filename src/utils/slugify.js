const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;

export function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(NON_ALPHANUMERIC_REGEX, '-')
    .replace(/^-+|-+$/g, '');
}

