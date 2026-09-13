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
  } finally {
    connection.release();
  }
}

module.exports = { pool, initDB };
