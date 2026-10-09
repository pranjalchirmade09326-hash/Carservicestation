const { pool } = require('../config/db');

function mapBookingRow(r, includeUser = false) {
  const booking = {
    id: r.id,
    userId: r.userId,
    vehicleId: r.vehicleId,
    serviceId: r.serviceId,
    bookingDate: r.bookingDate,
    notes: r.notes,
    status: r.status,
    totalAmount: r.totalAmount,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    vehicle: r.v_id ? {
      id: r.v_id,
      registrationNo: r.v_registrationNo,
      make: r.v_make,
      model: r.v_model,
      year: r.v_year,
      fuelType: r.v_fuelType,
      color: r.v_color
    } : null,
    service: r.s_id ? {
      id: r.s_id,
      name: r.s_name,
      description: r.s_description,
      price: r.s_price,
      durationMinutes: r.s_durationMinutes
    } : null
  };

  if (includeUser) {
    booking.user = r.u_id ? {
      id: r.u_id,
      name: r.u_name,
      email: r.u_email,
      phone: r.u_phone
    } : null;
  }

  return booking;
}

async function create(req, res, next) {
  try {
    const { vehicleId, serviceId, bookingDate, notes } = req.body;

    if (!vehicleId || !serviceId || !bookingDate) {
      return res.status(400).json({ message: 'vehicleId, serviceId and bookingDate are required' });
    }

    const parsedDate = new Date(bookingDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid bookingDate format' });
    }

    const [vRows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
    const vehicle = vRows[0];
    if (!vehicle || vehicle.ownerId !== req.user.id) {
      return res.status(400).json({ message: 'Invalid vehicle' });
    }

    let [sRows] = await pool.query('SELECT * FROM services WHERE id = ?', [serviceId]);
    let service = sRows[0];
    if (!service || !service.isActive) {
      try {
        const { seedDB } = require('../config/db');
        await seedDB();
        const [recheckRows] = await pool.query('SELECT * FROM services WHERE id = ?', [serviceId]);
        service = recheckRows[0];
      } catch (seedErr) {
        console.error('Auto-seed in create booking failed:', seedErr.message);
      }
    }

    if (!service || !service.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive service' });
    }

    const [result] = await pool.query(
      'INSERT INTO bookings (userId, vehicleId, serviceId, bookingDate, notes, status, totalAmount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, "pending", ?, NOW(), NOW())',
      [req.user.id, vehicleId, serviceId, new Date(bookingDate), notes || '', service.price]
    );

    const [bRows] = await pool.query(`
      SELECT 
        b.*,
        v.id AS v_id, v.registrationNo AS v_registrationNo, v.make AS v_make, v.model AS v_model, v.year AS v_year, v.fuelType AS v_fuelType, v.color AS v_color,
        s.id AS s_id, s.name AS s_name, s.description AS s_description, s.price AS s_price, s.durationMinutes AS s_durationMinutes
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicleId = v.id
      LEFT JOIN services s ON b.serviceId = s.id
      WHERE b.id = ?
    `, [result.insertId]);

    res.status(201).json(mapBookingRow(bRows[0]));
  } catch (err) {
    next(err);
  }
}

async function mine(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.*,
        v.id AS v_id, v.registrationNo AS v_registrationNo, v.make AS v_make, v.model AS v_model, v.year AS v_year, v.fuelType AS v_fuelType, v.color AS v_color,
        s.id AS s_id, s.name AS s_name, s.description AS s_description, s.price AS s_price, s.durationMinutes AS s_durationMinutes
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicleId = v.id
      LEFT JOIN services s ON b.serviceId = s.id
      WHERE b.userId = ?
      ORDER BY b.bookingDate DESC
    `, [req.user.id]);

    res.json(rows.map(r => mapBookingRow(r)));
  } catch (err) {
    next(err);
  }
}

async function all(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.*,
        v.id AS v_id, v.registrationNo AS v_registrationNo, v.make AS v_make, v.model AS v_model, v.year AS v_year, v.fuelType AS v_fuelType, v.color AS v_color,
        s.id AS s_id, s.name AS s_name, s.description AS s_description, s.price AS s_price, s.durationMinutes AS s_durationMinutes,
        u.id AS u_id, u.name AS u_name, u.email AS u_email, u.phone AS u_phone
      FROM bookings b
      LEFT JOIN users u ON b.userId = u.id
      LEFT JOIN vehicles v ON b.vehicleId = v.id
      LEFT JOIN services s ON b.serviceId = s.id
      ORDER BY b.bookingDate DESC
    `);

    res.json(rows.map(r => mapBookingRow(r, true)));
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const [bRows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    const booking = bRows[0];
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const allowed = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    await pool.query('UPDATE bookings SET status = ?, updatedAt = NOW() WHERE id = ?', [req.body.status, req.params.id]);
    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
}

async function updateMine(req, res, next) {
  try {
    const [bRows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    const booking = bRows[0];
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this booking' });
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'This booking can no longer be changed' });
    }

    const { bookingDate, notes } = req.body;

    await pool.query(
      `UPDATE bookings 
       SET bookingDate = COALESCE(?, bookingDate),
           notes = COALESCE(?, notes),
           updatedAt = NOW()
       WHERE id = ?`,
      [bookingDate ? new Date(bookingDate) : null, notes !== undefined ? notes : null, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
}

async function removeMine(req, res, next) {
  try {
    const [bRows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    const booking = bRows[0];
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this booking' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed booking cannot be deleted' });
    }

    await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Booking cancelled/deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, mine, all, updateStatus, updateMine, removeMine };
