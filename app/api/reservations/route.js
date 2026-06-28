import { getReservations, createReservation } from '@/modules/table/table.controller.js';
export const GET  = getReservations;
export const POST = createReservation;
export const dynamic = 'force-dynamic';
