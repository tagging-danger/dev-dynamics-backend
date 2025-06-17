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
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to database');
  release();
});

// Initialize database schema
const db = require('./config/database');
db.initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Expense Splitter API',
    endpoints: {
      people: '/people',
      expenses: '/expenses',
      settlements: '/settlements',
      balances: '/balances'
    }
  });
});

// Routes - Updated to match assignment requirements exactly
app.use('/expenses', require('./routes/expenses'));
app.use('/settlements', require('./routes/settlements'));
app.use('/people', require('./routes/people'));
app.use('/balances', require('./routes/balances'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app; 