const express = require('express');
const router = express.Router();
const peopleController = require('../controllers/peopleController');

router.get('/', peopleController.getAllPeople);

module.exports = router; 