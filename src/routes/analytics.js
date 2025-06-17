const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Routes
router.get('/monthly', analyticsController.getMonthlySummary);
router.get('/individual', analyticsController.getIndividualSpending);
router.get('/top-expenses', analyticsController.getMostExpensiveTransactions);
router.get('/categories', analyticsController.getCategorySpending);

module.exports = router; 