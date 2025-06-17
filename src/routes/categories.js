const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const validateRequest = require('../middleware/validateRequest');

// Validation middleware
const validateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
  validateRequest
];

// Routes
router.get('/', categoryController.getAllCategories);
router.post('/', validateCategory, categoryController.createCategory);
router.get('/summary', categoryController.getCategorySummary);

module.exports = router; 