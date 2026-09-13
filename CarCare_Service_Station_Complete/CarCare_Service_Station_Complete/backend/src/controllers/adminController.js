const { pool } = require('../config/db');

async function dashboard(req, res, next) {
  try {
    const [
      [uRows],
      [vRows],
      [sRows],
      [bRows],
      [pRows],
      [cRows]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM users'),
      pool.query('SELECT COUNT(*) AS count FROM vehicles'),
      pool.query('SELECT COUNT(*) AS count FROM services WHERE isActive = 1'),
      pool.query('SELECT COUNT(*) AS count FROM bookings'),
      pool.query('SELECT COUNT(*) AS count FROM bookings WHERE status = "pending"'),
      pool.query('SELECT COUNT(*) AS count FROM bookings WHERE status = "completed"')
    ]);

    res.json({
      users: uRows[0].count,
      vehicles: vRows[0].count,
      services: sRows[0].count,
      bookings: bRows[0].count,
      pending: pRows[0].count,
      completed: cRows[0].count
    });
  } catch (err) {
    next(err);
  }
}

async function users(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone, createdAt, updatedAt FROM users ORDER BY createdAt DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot delete current account' });
    if (user.role === 'super_admin') return res.status(403).json({ message: 'Super Admin cannot be deleted' });

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard, users, deleteUser };
