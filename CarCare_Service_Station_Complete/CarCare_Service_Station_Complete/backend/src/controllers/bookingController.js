const { Booking, Vehicle, Service, User } = require('../models');

async function create(req, res, next) {
  try {
    const { vehicleId, serviceId, bookingDate, notes } = req.body;

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle || vehicle.ownerId !== req.user.id) {
      return res.status(400).json({ message: 'Invalid vehicle' });
    }

    const service = await Service.findByPk(serviceId);
    if (!service || !service.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive service' });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      vehicleId,
      serviceId,
      bookingDate,
      notes: notes || '',
      totalAmount: service.price
    });

    const full = await Booking.findByPk(booking.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Service, as: 'service' }
      ]
    });

    res.status(201).json(full);
  } catch (err) { next(err); }
}

async function mine(req, res, next) {
  try {
    const rows = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Service, as: 'service' }
      ],
      order: [['bookingDate', 'DESC']]
    });
    res.json(rows);
  } catch (err) { next(err); }
}

async function all(req, res, next) {
  try {
    const rows = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Vehicle, as: 'vehicle' },
        { model: Service, as: 'service' }
      ],
      order: [['bookingDate', 'DESC']]
    });
    res.json(rows);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const allowed = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    booking.status = req.body.status;
    await booking.save();
    res.json(booking);
  } catch (err) { next(err); }
}

async function updateMine(req, res, next) {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this booking' });
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'This booking can no longer be changed' });
    }

    if (req.body.bookingDate !== undefined) booking.bookingDate = req.body.bookingDate;
    if (req.body.notes !== undefined) booking.notes = req.body.notes;
    await booking.save();

    res.json(booking);
  } catch (err) { next(err); }
}

async function removeMine(req, res, next) {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this booking' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed booking cannot be deleted' });
    }
    await booking.destroy();
    res.json({ message: 'Booking cancelled/deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = { create, mine, all, updateStatus, updateMine, removeMine };
