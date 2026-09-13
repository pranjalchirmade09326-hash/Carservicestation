const { pool } = require('../config/db');

async function list(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vehicles WHERE ownerId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { registrationNo, make, model, year, fuelType, color } = req.body;
    if (!registrationNo || !make || !model) {
      return res.status(400).json({ message: 'registrationNo, make and model are required' });
    }

    const [exists] = await pool.query('SELECT id FROM vehicles WHERE registrationNo = ?', [registrationNo]);
    if (exists.length > 0) {
      return res.status(409).json({ message: 'Registration number already exists' });
    }

    const [result] = await pool.query(
      'INSERT INTO vehicles (ownerId, registrationNo, make, model, year, fuelType, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [req.user.id, registrationNo, make, model, year || null, fuelType || 'Petrol', color || null]
    );

    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    const vehicle = rows[0];
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.ownerId !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not own this vehicle' });
    }

    const { registrationNo, make, model, year, fuelType, color } = req.body;

    if (registrationNo && registrationNo !== vehicle.registrationNo) {
      const [exists] = await pool.query(
        'SELECT id FROM vehicles WHERE registrationNo = ? AND id != ?',
        [registrationNo, req.params.id]
      );
      if (exists.length > 0) {
        return res.status(409).json({ message: 'Registration number already exists' });
      }
    }

    await pool.query(
      `UPDATE vehicles 
       SET registrationNo = COALESCE(?, registrationNo),
           make = COALESCE(?, make),
           model = COALESCE(?, model),
           year = COALESCE(?, year),
           fuelType = COALESCE(?, fuelType),
           color = COALESCE(?, color),
           updatedAt = NOW()
       WHERE id = ?`,
      [
        registrationNo !== undefined ? registrationNo : null,
        make !== undefined ? make : null,
        model !== undefined ? model : null,
        year !== undefined ? year : null,
        fuelType !== undefined ? fuelType : null,
        color !== undefined ? color : null,
        req.params.id
      ]
    );

    const [updatedRows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    res.json(updatedRows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    const vehicle = rows[0];
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.ownerId !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not own this vehicle' });
    }

    await pool.query('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
