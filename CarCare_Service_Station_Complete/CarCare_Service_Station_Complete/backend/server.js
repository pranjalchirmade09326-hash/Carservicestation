require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./src/config/db');
const routes = require('./src/routes/routes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'CarCare API is running',
    version: '1.0.0',
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'CarCare API is running',
    version: '1.0.0',
  });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    // Verify connection to MySQL
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully.');
    connection.release();

    // Ensure all tables and constraints exist
    await initDB();

    app.listen(PORT, () => {
      console.log(`CarCare API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
}

start();
