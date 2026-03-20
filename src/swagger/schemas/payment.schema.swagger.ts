export const paymentSchema = {
  type: 'object',
  properties: {
    storeId: {
      type: 'string',
      format: 'uuid',
      example: '550e8400-e29b-41d4-a716-446655440011',
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440022',
          },
          quantity: {
            type: 'integer',
            example: 3,
          },
        },
      },
    },
  },
  required: ['storeId', 'items'],
};
