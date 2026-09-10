const { Service } = require('../models');
const { Op } = require('sequelize');

async function list(req, res, next) {
  try {
    const { search, page = 1, limit = 8 } = req.query;
    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 8, 1), 50);
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const result = await Service.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: safeLimit,
      offset: (safePage - 1) * safeLimit
    });

    res.json({
      services: result.rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: result.count,
        totalPages: Math.ceil(result.count / safeLimit)
      }
    });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, description, price, durationMinutes } = req.body;
    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'name, description and price are required' });
    }
    const service = await Service.create({ name, description, price, durationMinutes });
    res.status(201).json(service);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await service.update(req.body);
    res.json(service);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    service.isActive = false;
    await service.save();
    res.json({ message: 'Service disabled successfully' });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
