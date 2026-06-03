const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Yeni kullanıcı kaydı (Mock)
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Kullanıcı girişi & JWT üretimi (Mock)
// @access  Public
router.post('/login', authController.login);

module.exports = router;
