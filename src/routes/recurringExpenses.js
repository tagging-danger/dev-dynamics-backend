const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const recurringExpenseController = require('../controllers/recurringExpenseController');
const validateRequest = require('../middleware/validateRequest');

// Validation middleware
const validateRecurringExpense = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('paid_by')
    .trim()
    .notEmpty()
    .withMessage('Paid by is required'),
  body('category_id')
    .isInt()
    .withMessage('Category ID must be a number'),
  body('split_type')
    .isIn(['equal', 'percentage', 'exact'])
    .withMessage('Split type must be equal, percentage, or exact'),
  body('split_details')
    .isObject()
    .withMessage('Split details must be an object'),
  body('frequency')
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Frequency must be daily, weekly, monthly, or yearly'),
  body('start_date')
    .isDate()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .optional()
    .isDate()
    .withMessage('End date must be a valid date'),
  validateRequest
];

// Routes
router.get('/', recurringExpenseController.getAllRecurringExpenses);
router.post('/', validateRecurringExpense, recurringExpenseController.createRecurringExpense);
router.post('/process', recurringExpenseController.processRecurringExpenses);

module.exports = router; 