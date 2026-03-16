export function toEventCreateInput(body = {}) {
  const { tags, ...rest } = body;
  let normalizedTags = [];
  if (Array.isArray(tags)) {
    normalizedTags = tags;
  } else if (typeof tags === 'string') {
    normalizedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return {
    ...rest,
    tags: normalizedTags,
  };
}

