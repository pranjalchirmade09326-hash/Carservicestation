const { pool } = require('../config/db');

async function list(req, res, next) {
  try {
    const { search, page = 1, limit } = req.query;
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = limit ? Math.min(Math.max(parseInt(limit, 10) || 8, 1), 100) : 50;
    const offset = (safePage - 1) * safeLimit;

    let countSql = 'SELECT COUNT(*) AS total FROM services WHERE isActive = 1';
    let dataSql = 'SELECT * FROM services WHERE isActive = 1';
    const params = [];

    if (search) {
      countSql += ' AND (name LIKE ? OR description LIKE ?)';
      dataSql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    dataSql += ' ORDER BY name ASC LIMIT ? OFFSET ?';

    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const [rows] = await pool.query(dataSql, [...params, safeLimit, offset]);

    res.json({
      services: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, description, price, durationMinutes } = req.body;
    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'name, description and price are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO services (name, description, price, durationMinutes, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
      [name, description, parseInt(price, 10), durationMinutes ? parseInt(durationMinutes, 10) : null]
    );

    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    const service = rows[0];
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const { name, description, price, durationMinutes, isActive } = req.body;

    await pool.query(
      `UPDATE services 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           durationMinutes = COALESCE(?, durationMinutes),
           isActive = COALESCE(?, isActive),
           updatedAt = NOW()
       WHERE id = ?`,
      [
        name !== undefined ? name : null,
        description !== undefined ? description : null,
        price !== undefined ? parseInt(price, 10) : null,
        durationMinutes !== undefined ? parseInt(durationMinutes, 10) : null,
        isActive !== undefined ? (isActive ? 1 : 0) : null,
        req.params.id
      ]
    );

    const [updatedRows] = await pool.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    res.json(updatedRows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    const service = rows[0];
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await pool.query('UPDATE services SET isActive = 0, updatedAt = NOW() WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service disabled successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
