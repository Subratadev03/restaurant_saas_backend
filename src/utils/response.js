import { NextResponse } from 'next/server';

export function sendSuccess(data, message = 'Success', status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function sendError(message, status = 400, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return NextResponse.json(body, { status });
}

export function sendPaginated(items, total, page, limit, message = 'Success') {
  return NextResponse.json({
    success: true,
    message,
    data: items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}
