const { Vehicle } = require('../models');

async function list(req, res, next) {
  try {
    const rows = await Vehicle.findAll({
      where: { ownerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(rows);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { registrationNo, make, model, year, fuelType, color } = req.body;
    if (!registrationNo || !make || !model) {
      return res.status(400).json({ message: 'registrationNo, make and model are required' });
    }

    const exists = await Vehicle.findOne({ where: { registrationNo } });
    if (exists) return res.status(409).json({ message: 'Registration number already exists' });

    const vehicle = await Vehicle.create({
      ownerId: req.user.id, registrationNo, make, model, year, fuelType, color
    });
    res.status(201).json(vehicle);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.ownerId !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not own this vehicle' });
    }

    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.ownerId !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not own this vehicle' });
    }

    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
