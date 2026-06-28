import { getTables, createTable } from '@/modules/table/table.controller.js';
export const GET  = getTables;
export const POST = createTable;
export const dynamic = 'force-dynamic';
