const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'super_admin'),
    allowNull: false,
    defaultValue: 'user'
  },
  phone: DataTypes.STRING(20)
}, {
  tableName: 'users',
  indexes: [{ unique: true, fields: ['email'] }]
});

const Vehicle = sequelize.define('Vehicle', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ownerId: { type: DataTypes.INTEGER, allowNull: false },
  registrationNo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  make: { type: DataTypes.STRING(80), allowNull: false },
  model: { type: DataTypes.STRING(80), allowNull: false },
  year: DataTypes.INTEGER,
  fuelType: DataTypes.ENUM('Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'),
  color: DataTypes.STRING(40)
}, {
  tableName: 'vehicles',
  indexes: [
    { fields: ['ownerId'] },
    { unique: true, fields: ['registrationNo'] }
  ]
});

const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  durationMinutes: DataTypes.INTEGER,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'services',
  indexes: [{ fields: ['isActive'] }]
});

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false },
  serviceId: { type: DataTypes.INTEGER, allowNull: false },
  bookingDate: { type: DataTypes.DATE, allowNull: false },
  notes: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  totalAmount: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'bookings',
  indexes: [
    { fields: ['userId'] },
    { fields: ['vehicleId'] },
    { fields: ['serviceId'] },
    { fields: ['bookingDate'] },
    { fields: ['status'] }
  ]
});

User.hasMany(Vehicle, { foreignKey: 'ownerId', as: 'vehicles', onDelete: 'CASCADE' });
Vehicle.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Vehicle.hasMany(Booking, { foreignKey: 'vehicleId', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings', onDelete: 'RESTRICT' });
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

module.exports = { sequelize, User, Vehicle, Service, Booking };
