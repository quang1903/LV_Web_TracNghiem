const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const User = require('../models/user.model');
const { authenticate } = require('../../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);

module.exports = router;

// Thêm route me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Thêm route logout
router.post('/logout', authenticate, (req, res) => {
  res.json({ success: true, message: 'Đăng xuất thành công' });
});