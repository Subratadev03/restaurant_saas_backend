import { NextResponse } from 'next/server';

export function GET(request) {
  const host = request.headers.get('host') || 'localhost:3001';
  const protocol = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'http';
  const serverUrl = `${protocol}://${host}`;

  const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Restaurant SaaS API',
    version: '1.0.0',
    description: 'REST API for Restaurant SaaS — authentication and order management.',
  },
  servers: [
    { url: serverUrl, description: 'API Server' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token obtained from the login endpoint.',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['restaurant', 'owner'],
        properties: {
          restaurant: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name:    { type: 'string', minLength: 2, example: 'The Grand Bistro' },
              email:   { type: 'string', format: 'email', example: 'contact@grandbistro.com' },
              phone:   { type: 'string', example: '+91-9876543210' },
              address: { type: 'string', example: '12 Main Street' },
              city:    { type: 'string', example: 'Mumbai' },
              slug:    { type: 'string', pattern: '^[a-z0-9-]+$', example: 'grand-bistro' },
            },
          },
          owner: {
            type: 'object',
            required: ['firstName', 'email', 'password'],
            properties: {
              firstName: { type: 'string', example: 'Arjun' },
              lastName:  { type: 'string', example: 'Sharma' },
              email:     { type: 'string', format: 'email', example: 'arjun@grandbistro.com' },
              password:  { type: 'string', minLength: 8, example: 'Secret@123' },
              phone:     { type: 'string', example: '+91-9876543210' },
            },
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email', example: 'arjun@grandbistro.com' },
          password: { type: 'string', minLength: 6, example: 'Secret@123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success:      { type: 'boolean', example: true },
          message:      { type: 'string', example: 'Login successful' },
          accessToken:  { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...' },
          user: {
            type: 'object',
            properties: {
              id:        { type: 'string', format: 'uuid' },
              email:     { type: 'string' },
              firstName: { type: 'string' },
              role:      { type: 'string', example: 'owner' },
            },
          },
        },
      },
      OrderItem: {
        type: 'object',
        required: ['menuItemId', 'menuItemName', 'quantity', 'unitPrice'],
        properties: {
          menuItemId:   { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          menuItemName: { type: 'string', example: 'Margherita Pizza' },
          quantity:     { type: 'integer', minimum: 1, example: 2 },
          unitPrice:    { type: 'number', minimum: 0, example: 349.00 },
          modifiers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name:  { type: 'string', example: 'Extra Cheese' },
                price: { type: 'number', example: 50 },
              },
            },
          },
          notes: { type: 'string', example: 'No onions' },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['items'],
        properties: {
          type:        { type: 'string', enum: ['dine_in', 'takeaway', 'delivery', 'online'], default: 'dine_in' },
          tableNumber: { type: 'string', example: 'T-05' },
          tableId:     { type: 'string', format: 'uuid' },
          customerId:  { type: 'string', format: 'uuid' },
          notes:       { type: 'string', example: 'Rush order' },
          items: {
            type: 'array',
            minItems: 1,
            items: { $ref: '#/components/schemas/OrderItem' },
          },
          deliveryAddress: {
            type: 'object',
            properties: {
              street:  { type: 'string', example: '12 Main Street' },
              city:    { type: 'string', example: 'Mumbai' },
              pincode: { type: 'string', example: '400001' },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors:  { type: 'object' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new restaurant',
        description: 'Creates a new restaurant along with an owner account. Returns a JWT on success.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Restaurant registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success:     { type: 'boolean', example: true },
                    message:     { type: 'string', example: 'Restaurant registered successfully' },
                    accessToken: { type: 'string' },
                  },
                },
              },
            },
          },
          422: {
            description: 'Validation error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          409: {
            description: 'Email already exists',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Authenticates a user and returns a JWT access token and refresh token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: {
            description: 'Validation error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders',
        description: 'Returns a paginated list of orders for the authenticated restaurant. Supports filtering by status and type.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page',   schema: { type: 'integer', default: 1 },   description: 'Page number' },
          { in: 'query', name: 'limit',  schema: { type: 'integer', default: 20 },  description: 'Items per page' },
          {
            in: 'query', name: 'status',
            schema: { type: 'string', enum: ['received', 'preparing', 'ready', 'delivered', 'cancelled'] },
            description: 'Filter by order status',
          },
          {
            in: 'query', name: 'type',
            schema: { type: 'string', enum: ['dine_in', 'takeaway', 'delivery', 'online'] },
            description: 'Filter by order type',
          },
        ],
        responses: {
          200: {
            description: 'Paginated list of orders',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data:    { type: 'array', items: { type: 'object' } },
                    pagination: {
                      type: 'object',
                      properties: {
                        total:       { type: 'integer' },
                        page:        { type: 'integer' },
                        limit:       { type: 'integer' },
                        totalPages:  { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized — missing or invalid token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create an order',
        description: 'Creates a new order for the authenticated restaurant. Calculates subtotal, tax (5%), and total automatically.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOrderRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Order created' },
                    data: {
                      type: 'object',
                      properties: {
                        id:          { type: 'string', format: 'uuid' },
                        orderNumber: { type: 'string', example: 'ORD-0001' },
                        type:        { type: 'string', example: 'dine_in' },
                        status:      { type: 'string', example: 'received' },
                        subtotal:    { type: 'number', example: 698.00 },
                        taxAmount:   { type: 'number', example: 34.90 },
                        totalAmount: { type: 'number', example: 732.90 },
                        items:       { type: 'array', items: { type: 'object' } },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: {
            description: 'Validation error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
  },
};

  return NextResponse.json(spec);
}
