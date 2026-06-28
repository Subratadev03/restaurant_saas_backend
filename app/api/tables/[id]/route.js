import { getTable, updateTable, deleteTable } from '@/modules/table/table.controller.js';
export const GET    = getTable;
export const PUT    = updateTable;
export const DELETE = deleteTable;
export const dynamic = 'force-dynamic';
