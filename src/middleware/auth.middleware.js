import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Verify JWT from Authorization header.
 * Returns the decoded payload or a 401 NextResponse.
 */
export async function authenticate(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return NextResponse.json({ success: false, message }, { status: 401 });
  }
}

/**
 * Authorize by role.  Returns null if allowed, 403 response if denied.
 */
export function authorize(user, allowedRoles = []) {
  if (!allowedRoles.length) return null;
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
  }
  return null;
}

/** Parse ?page=&limit= query params. */
export function getPagination(url) {
  const page  = Math.max(1, parseInt(url.searchParams.get('page')  || '1',  10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  return { page, limit, offset: (page - 1) * limit };
}
