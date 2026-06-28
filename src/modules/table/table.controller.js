import { Op } from 'sequelize';
import { errorHandler } from '@/middleware/error.middleware.js';
import { authenticate, authorize, getPagination } from '@/middleware/auth.middleware.js';
import { sendSuccess, sendError, sendPaginated } from '@/utils/response.js';
import { RestaurantTable, Reservation, Customer, Order } from '@/models/index.js';

// ── Tables ─────────────────────────────────────────────────────────────────

export async function getTables(req) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const { status, tableType, floor, active } = Object.fromEntries(req.nextUrl.searchParams);
    const where = { restaurantId: user.restaurantId };
    if (status)              where.status    = status;
    if (tableType)           where.tableType = tableType;
    if (floor)               where.floor     = floor;
    if (active !== undefined) where.isActive = active === 'true';

    const today = new Date().toISOString().slice(0, 10);
    const tables = await RestaurantTable.findAll({
      where,
      order: [['tableNumber', 'ASC']],
      include: [{
        model: Reservation,
        as: 'reservations',
        where: {
          reservationDate: today,
          status: { [Op.notIn]: ['cancelled', 'completed', 'no_show'] },
        },
        required: false,
        order: [['startTime', 'ASC']],
      }],
    });
    return sendSuccess(tables, 'Tables fetched');
  });
}

export async function createTable(req) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const denied = authorize(user, ['restaurant_owner', 'manager', 'super_admin']);
    if (denied) return denied;
    const body = await req.json();
    const { tableNumber, tableName, tableType, capacity, floor, description, features } = body;
    if (!tableNumber) return sendError('tableNumber is required', 400);

    const exists = await RestaurantTable.findOne({ where: { restaurantId: user.restaurantId, tableNumber } });
    if (exists) return sendError('Table number already exists', 409);

    const table = await RestaurantTable.create({
      restaurantId: user.restaurantId, tableNumber, tableName,
      tableType: tableType || 'standard', capacity: capacity || 4,
      floor, description, features,
    });
    return sendSuccess(table, 'Table created', 201);
  });
}

export async function getTable(req, { params }) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const { id } = await params;
    const table = await RestaurantTable.findOne({
      where: { id, restaurantId: user.restaurantId },
      include: [{
        model: Reservation,
        as: 'reservations',
        include: [{ model: Customer, as: 'customer' }],
        order: [['reservationDate', 'ASC'], ['startTime', 'ASC']],
      }],
    });
    if (!table) return sendError('Table not found', 404);
    return sendSuccess(table);
  });
}

export async function updateTable(req, { params }) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const denied = authorize(user, ['restaurant_owner', 'manager', 'super_admin']);
    if (denied) return denied;
    const { id } = await params;
    const table = await RestaurantTable.findOne({ where: { id, restaurantId: user.restaurantId } });
    if (!table) return sendError('Table not found', 404);
    const body = await req.json();
    await table.update(body);
    return sendSuccess(table, 'Table updated');
  });
}

export async function deleteTable(req, { params }) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const denied = authorize(user, ['restaurant_owner', 'super_admin']);
    if (denied) return denied;
    const { id } = await params;
    const table = await RestaurantTable.findOne({ where: { id, restaurantId: user.restaurantId } });
    if (!table) return sendError('Table not found', 404);
    await table.destroy();
    return sendSuccess(null, 'Table deleted');
  });
}

export async function updateTableStatus(req, { params }) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const { id } = await params;
    const { status } = await req.json();
    const table = await RestaurantTable.findOne({ where: { id, restaurantId: user.restaurantId } });
    if (!table) return sendError('Table not found', 404);
    await table.update({ status });
    return sendSuccess(table, 'Status updated');
  });
}

// ── Reservations ───────────────────────────────────────────────────────────

export async function getReservations(req) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const { date, status, tableId } = Object.fromEntries(req.nextUrl.searchParams);
    const { limit, offset, page } = getPagination(req.nextUrl);
    const where = { restaurantId: user.restaurantId };
    if (date)    where.reservationDate = date;
    if (status)  where.status          = status;
    if (tableId) where.tableId         = tableId;

    const { rows, count } = await Reservation.findAndCountAll({
      where,
      limit,
      offset,
      order: [['reservationDate', 'ASC'], ['startTime', 'ASC']],
      include: [
        { model: RestaurantTable, as: 'table' },
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone', 'email'] },
      ],
    });
    return sendPaginated(rows, count, page, limit);
  });
}

export async function createReservation(req) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const body = await req.json();
    const { tableId, guestName, guestPhone, guestEmail, partySize, reservationDate, startTime, endTime, notes, specialRequests, customerId } = body;

    if (!tableId || !guestName || !reservationDate || !startTime)
      return sendError('tableId, guestName, reservationDate and startTime are required', 400);

    const table = await RestaurantTable.findOne({ where: { id: tableId, restaurantId: user.restaurantId } });
    if (!table) return sendError('Table not found', 404);

    const conflict = await Reservation.findOne({
      where: {
        tableId,
        reservationDate,
        status: { [Op.notIn]: ['cancelled', 'completed', 'no_show'] },
        startTime: { [Op.lt]: endTime || '23:59' },
        [Op.or]: [{ endTime: null }, { endTime: { [Op.gt]: startTime } }],
      },
    });
    if (conflict) return sendError('Table already has a reservation in that time slot', 409);

    const reservation = await Reservation.create({
      restaurantId: user.restaurantId,
      tableId, customerId, guestName, guestPhone, guestEmail,
      partySize: partySize || 1, reservationDate, startTime, endTime,
      notes, specialRequests,
    });
    await table.update({ status: 'reserved' });

    const full = await Reservation.findByPk(reservation.id, {
      include: [
        { model: RestaurantTable, as: 'table' },
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone', 'email'] },
      ],
    });
    return sendSuccess(full, 'Reservation created', 201);
  });
}

export async function updateReservation(req, { params }) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const { id } = await params;
    const reservation = await Reservation.findOne({ where: { id, restaurantId: user.restaurantId } });
    if (!reservation) return sendError('Reservation not found', 404);
    const body = await req.json();
    await reservation.update(body);

    if (['completed', 'cancelled', 'no_show'].includes(body.status)) {
      const active = await Reservation.findOne({
        where: {
          tableId: reservation.tableId,
          status: { [Op.notIn]: ['cancelled', 'completed', 'no_show'] },
          id: { [Op.ne]: reservation.id },
        },
      });
      await RestaurantTable.update(
        { status: active ? 'reserved' : 'available' },
        { where: { id: reservation.tableId } },
      );
    }
    return sendSuccess(reservation, 'Reservation updated');
  });
}

export async function cancelReservation(req, { params }) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return errorHandler(req, async () => {
    const { id } = await params;
    const reservation = await Reservation.findOne({ where: { id, restaurantId: user.restaurantId } });
    if (!reservation) return sendError('Reservation not found', 404);
    await reservation.update({ status: 'cancelled' });
    const others = await Reservation.count({
      where: { tableId: reservation.tableId, status: { [Op.in]: ['pending', 'confirmed', 'seated'] } },
    });
    if (!others) await RestaurantTable.update({ status: 'available' }, { where: { id: reservation.tableId } });
    return sendSuccess(null, 'Reservation cancelled');
  });
}
