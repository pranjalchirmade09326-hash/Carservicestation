const express = require('express');
const router = express.Router();

const auth = require('../controllers/authController');
const vehicle = require('../controllers/vehicleController');
const service = require('../controllers/serviceController');
const booking = require('../controllers/bookingController');
const admin = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);

router.get('/services', service.list);
router.post('/services', protect, authorize('admin', 'super_admin'), service.create);
router.put('/services/:id', protect, authorize('admin', 'super_admin'), service.update);
router.delete('/services/:id', protect, authorize('admin', 'super_admin'), service.remove);

router.get('/vehicles', protect, vehicle.list);
router.post('/vehicles', protect, vehicle.create);
router.put('/vehicles/:id', protect, vehicle.update);
router.delete('/vehicles/:id', protect, vehicle.remove);

router.post('/bookings', protect, booking.create);
router.get('/bookings/my', protect, booking.mine);
router.put('/bookings/:id', protect, booking.updateMine);
router.delete('/bookings/:id', protect, booking.removeMine);

router.get('/admin/dashboard', protect, authorize('admin', 'super_admin'), admin.dashboard);
router.get('/admin/bookings', protect, authorize('admin', 'super_admin'), booking.all);
router.patch('/admin/bookings/:id/status', protect, authorize('admin', 'super_admin'), booking.updateStatus);
router.get('/admin/users', protect, authorize('admin', 'super_admin'), admin.users);

router.delete('/super-admin/users/:id', protect, authorize('super_admin'), admin.deleteUser);

// Database seed endpoint for initializing users and 10 mock services
router.get('/seed', async (req, res, next) => {
  try {
    const { seedDB } = require('../config/db');
    const result = await seedDB();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
