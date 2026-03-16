function normalizeLocation(location) {
  if (!location) {
    return {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    };
  }

  if (typeof location === 'string') {
    const [city = '', country = ''] = location.split(',').map((token) => token.trim());
    return {
      addressLine1: '',
      addressLine2: '',
      city,
      state: '',
      country,
      postalCode: '',
    };
  }

  return {
    addressLine1: location.addressLine1 ?? '',
    addressLine2: location.addressLine2 ?? '',
    city: location.city ?? '',
    state: location.state ?? '',
    country: location.country ?? '',
    postalCode: location.postalCode ?? '',
  };
}

function normalizeFeatures(features) {
  if (Array.isArray(features)) {
    return features;
  }
  if (typeof features === 'string') {
    return features
      .split(',')
      .map((feature) => feature.trim())
      .filter(Boolean);
  }
  return [];
}

export function toVenueCreateInput(body = {}) {
  const { location, features, ...rest } = body;
  return {
    ...rest,
    location: normalizeLocation(location),
    features: normalizeFeatures(features),
  };
}

