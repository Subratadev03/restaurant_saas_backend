import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'restaurant-saas', timestamp: new Date().toISOString() });
}
