const { User, Vehicle, Service, Booking } = require('../models');

async function dashboard(req, res, next) {
  try {
    const [users, vehicles, services, bookings, pending, completed] = await Promise.all([
      User.count(),
      Vehicle.count(),
      Service.count({ where: { isActive: true } }),
      Booking.count(),
      Booking.count({ where: { status: 'pending' } }),
      Booking.count({ where: { status: 'completed' } })
    ]);

    res.json({ users, vehicles, services, bookings, pending, completed });
  } catch (err) { next(err); }
}

async function users(req, res, next) {
  try {
    const rows = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(rows);
  } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot delete current account' });
    if (user.role === 'super_admin') return res.status(403).json({ message: 'Super Admin cannot be deleted' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = { dashboard, users, deleteUser };
