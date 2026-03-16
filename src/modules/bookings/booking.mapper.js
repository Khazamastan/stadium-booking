export function toBookingCreateInput(body = {}) {
  const { customer, customerName, customerEmail, customerPhone, ...rest } = body;

  if (customer) {
    return {
      ...rest,
      customer: {
        ...customer,
        name: customer.name?.trim() || 'Guest',
      },
    };
  }

  return {
    ...rest,
    customer: {
      name: (customerName ?? 'Guest').trim() || 'Guest',
      email: customerEmail,
      phone: customerPhone,
    },
  };
}

