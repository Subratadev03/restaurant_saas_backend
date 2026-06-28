import { NextResponse } from 'next/server';
import { logger } from '../utils/logger.js';

/**
 * Wrap any route handler with consistent error handling.
 *
 * Usage:
 *   export async function POST(request) {
 *     return errorHandler(request, async () => { ... });
 *   }
 */
export async function errorHandler(request, handler) {
  try {
    return await handler();
  } catch (err) {
    logger.error('[ErrorHandler]', {
      method: request.method,
      url: request.url,
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });

    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const errors = err.errors?.map((e) => ({ field: e.path, message: e.message }));
      return NextResponse.json({ success: false, message: 'Validation error', errors }, { status: 422 });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return NextResponse.json({ success: false, message: 'Referenced record does not exist' }, { status: 400 });
    }

    if (err.statusCode) {
      return NextResponse.json({ success: false, message: err.message }, { status: err.statusCode });
    }

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export function createError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
