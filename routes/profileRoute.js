const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.patch('/', authMiddleware, profileController.updateProfile);

module.exports = router;
