require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Expense Splitter API',
    endpoints: {
      people: '/api/people',
      expenses: '/api/expenses',
      settlements: '/api/settlements',
      balances: '/api/balances'
    }
  });
});

// Routes
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/settlements', require('./routes/settlements'));
app.use('/api/people', require('./routes/people'));
app.use('/api/balances', require('./routes/balances'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Initialize database and start server
const db = require('./config/database');
async function startServer() {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('Successfully connected to database');
    client.release();

    // Initialize database schema
    await db.initializeDatabase();
    console.log('Database schema initialized successfully');

    // Start server
    if (process.env.NODE_ENV !== 'test') {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 