const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'carcare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'super_admin') NOT NULL DEFAULT 'user',
        phone VARCHAR(20),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email)
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ownerId INT NOT NULL,
        registrationNo VARCHAR(30) NOT NULL UNIQUE,
        make VARCHAR(80) NOT NULL,
        model VARCHAR(80) NOT NULL,
        year INT,
        fuelType ENUM('Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'),
        color VARCHAR(40),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vehicles_owner (ownerId),
        CONSTRAINT fk_vehicles_owner FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        description TEXT NOT NULL,
        price INT NOT NULL,
        durationMinutes INT,
        isActive TINYINT(1) DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_services_active (isActive)
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        vehicleId INT NOT NULL,
        serviceId INT NOT NULL,
        bookingDate DATETIME NOT NULL,
        notes TEXT,
        status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        totalAmount INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_bookings_user (userId),
        INDEX idx_bookings_vehicle (vehicleId),
        INDEX idx_bookings_service (serviceId),
        INDEX idx_bookings_date (bookingDate),
        INDEX idx_bookings_status (status),
        CONSTRAINT fk_bookings_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE,
        CONSTRAINT fk_bookings_service FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    // Auto seed default users and 10 mock services if not present
    await seedDB(connection);
  } finally {
    connection.release();
  }
}

async function seedDB(existingConn) {
  const connection = existingConn || await pool.getConnection();
  const shouldRelease = !existingConn;

  try {
    const bcrypt = require('bcryptjs');

    // 1. Seed Users (Admin, Super Admin, Customer)
    const [adminRows] = await connection.query("SELECT id FROM users WHERE email = 'admin@carcare.com'");
    if (adminRows.length === 0) {
      const hashedPassword = await bcrypt.hash('Password@123', 10);
      await connection.query(`
        INSERT INTO users (name, email, password, role, phone, createdAt, updatedAt)
        VALUES 
          ('Service Center Admin', 'admin@carcare.com', ?, 'admin', '9876500002', NOW(), NOW()),
          ('CarCare Super Admin', 'superadmin@carcare.com', ?, 'super_admin', '9876500001', NOW(), NOW()),
          ('Rahul Patil', 'customer@gmail.com', ?, 'user', '9876500003', NOW(), NOW())
        ON DUPLICATE KEY UPDATE updatedAt = NOW()
      `, [hashedPassword, hashedPassword, hashedPassword]);
      console.log('Default users seeded successfully.');
    }

    // 2. Seed 10 Mock Services
    const mockServices = [
      ['Periodic Maintenance Service (Basic)', 'Comprehensive 40-point vehicle inspection, fluid top-up, wiper check, and spark plug cleaning.', 1999, 90],
      ['Standard Service & Oil Flush', 'Engine oil change, oil filter replacement, air filter cleaning, and brake inspection.', 2999, 120],
      ['Comprehensive Major Service', 'Full synthetic oil replacement, oil filter, air filter, fuel filter, spark plugs, coolant flush, and wheel inspection.', 4999, 180],
      ['Complete AC Deep Clean & Gas Refill', 'AC cabin filter replacement, evaporator coil antibacterial spray, condenser wash, and R134a refrigerant gas top-up.', 1899, 75],
      ['Computerized 3D Wheel Alignment & Balancing', 'High-precision laser alignment for all 4 wheels, automated dynamic wheel balancing, and tyre rotation.', 899, 45],
      ['Brake Overhaul & Pad Replacement', 'Front & rear brake pad wear inspection, disc rotor skimming/polishing, brake fluid bleeding, and caliper greasing.', 1499, 60],
      ['Premium Foam Wash & Interior Detailing', 'pH-neutral high-pressure snow foam wash, interior vacuuming, dashboard UV dressing, and upholstery steam sanitation.', 2199, 120],
      ['Battery Health Diagnostics & Terminals Service', 'Digital CCA battery load testing, alternator charging rate verification, and anti-corrosion terminal treatment.', 499, 30],
      ['Suspension & Steering Overhaul', 'Front & rear shock absorbers check, tie-rod end and ball joint inspection, bushing lubrication, and road test.', 2599, 110],
      ['Ceramic Paint Protection & Glass Coating', '3-step paint correction rubbing & polishing followed by 9H nano ceramic protective hydrophobic coat.', 5999, 240]
    ];

    const [existingServices] = await connection.query('SELECT id FROM services ORDER BY id ASC');
    for (let i = 0; i < mockServices.length; i++) {
      const [name, desc, price, duration] = mockServices[i];
      if (i < existingServices.length) {
        await connection.query(
          'UPDATE services SET name = ?, description = ?, price = ?, durationMinutes = ?, isActive = 1, updatedAt = NOW() WHERE id = ?',
          [name, desc, price, duration, existingServices[i].id]
        );
      } else {
        await connection.query(
          'INSERT INTO services (name, description, price, durationMinutes, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
          [name, desc, price, duration]
        );
      }
    }
    console.log('10 mock services seeded successfully.');
    return { success: true, message: 'Users and 10 mock services successfully seeded.' };
  } finally {
    if (shouldRelease) {
      connection.release();
    }
  }
}

module.exports = { pool, initDB, seedDB };
