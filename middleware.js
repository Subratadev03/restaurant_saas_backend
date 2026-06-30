import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');

export function middleware(request) {
  const origin = request.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV === 'development';

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(isAllowed ? origin : ''),
    });
  }

  // Clone and attach CORS headers to every API response
  const response = NextResponse.next();
  const headers = corsHeaders(isAllowed ? origin : '');
  Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

function corsHeaders(origin) {
  const allowedOrigin = origin || '*';
  const headers = {
    'Access-Control-Allow-Origin':  allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age':       '86400',
  };
  // Credentials cannot be used with wildcard origin — browsers block it
  if (allowedOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
}

export const config = {
  matcher: '/api/:path*',
};
