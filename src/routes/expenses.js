const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const validateRequest = require('../middleware/validateRequest');

// Validation middleware
const validateExpense = [
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
  body('split_type')
    .isIn(['equal', 'percentage', 'exact'])
    .withMessage('Split type must be equal, percentage, or exact'),
  body('split_details')
    .isObject()
    .withMessage('Split details must be an object'),
  validateRequest
];

// Routes
router.get('/', expenseController.getAllExpenses);
router.post('/', validateExpense, expenseController.createExpense);
router.put('/:id', [
  param('id').isInt().withMessage('Invalid expense ID'),
  ...validateExpense
], expenseController.updateExpense);
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid expense ID'),
  validateRequest
], expenseController.deleteExpense);

module.exports = router; 