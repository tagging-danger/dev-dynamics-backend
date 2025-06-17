const express = require('express');
const cors = require('cors');
const peopleRoutes = require('./routes/people');
const expenseRoutes = require('./routes/expenses');
const settlementRoutes = require('./routes/settlements');
const balanceRoutes = require('./routes/balances');
const categoryRoutes = require('./routes/categories');
const recurringExpenseRoutes = require('./routes/recurringExpenses');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/people', peopleRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recurring-expenses', recurringExpenseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app; 