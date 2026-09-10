require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Vehicle, Service, Booking } = require('../models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  const password = await bcrypt.hash('Password@123', 10);

  const superAdmin = await User.create({
    name: 'CarCare Super Admin',
    email: 'superadmin@carcare.com',
    password,
    role: 'super_admin',
    phone: '9876500001'
  });

  const admin = await User.create({
    name: 'Service Center Admin',
    email: 'admin@carcare.com',
    password,
    role: 'admin',
    phone: '9876500002'
  });

  const customer = await User.create({
    name: 'Rahul Patil',
    email: 'customer@gmail.com',
    password,
    role: 'user',
    phone: '9876500003'
  });

  const customer2 = await User.create({
    name: 'Sneha Joshi',
    email: 'sneha@gmail.com',
    password,
    role: 'user',
    phone: '9876500004'
  });

  const vehicle = await Vehicle.create({
    ownerId: customer.id,
    registrationNo: 'MH15AB1234',
    make: 'Hyundai',
    model: 'Creta',
    year: 2022,
    fuelType: 'Petrol',
    color: 'White'
  });

  await Vehicle.create({
    ownerId: customer2.id,
    registrationNo: 'MH12CD5678',
    make: 'Maruti Suzuki',
    model: 'Baleno',
    year: 2021,
    fuelType: 'Petrol',
    color: 'Blue'
  });

  const services = await Service.bulkCreate([
    {
      name: 'General Service',
      description: 'Engine oil check, filters, brake inspection and general vehicle inspection.',
      price: 2499,
      durationMinutes: 120
    },
    {
      name: 'Full Car Detailing',
      description: 'Interior cleaning, exterior wash, polishing and dashboard treatment.',
      price: 3499,
      durationMinutes: 180
    },
    {
      name: 'AC Service',
      description: 'AC inspection, gas check and cooling performance test.',
      price: 1799,
      durationMinutes: 90
    },
    {
      name: 'Wheel Alignment',
      description: 'Computerized wheel alignment and tyre pressure check.',
      price: 899,
      durationMinutes: 60
    },
    {
      name: 'Brake Inspection',
      description: 'Brake pads, discs, fluid and braking performance inspection.',
      price: 699,
      durationMinutes: 45
    },
    {
      name: 'Oil Change',
      description: 'Engine oil and oil filter replacement with multi-point inspection.',
      price: 1299,
      durationMinutes: 45
    }
  ]);

  await Booking.create({
    userId: customer.id,
    vehicleId: vehicle.id,
    serviceId: services[0].id,
    bookingDate: new Date(Date.now() + 86400000),
    notes: 'Please check brake noise during service.',
    status: 'confirmed',
    totalAmount: services[0].price
  });

  console.log('Seed complete.');
  console.log('Password: Password@123');
  console.log('Super Admin: superadmin@carcare.com');
  console.log('Admin: admin@carcare.com');
  console.log('User: customer@gmail.com');
  await sequelize.close();
}

seed().catch(async err => {
  console.error(err);
  await sequelize.close();
  process.exit(1);
});
