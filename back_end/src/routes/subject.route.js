const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/subject.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

// Lấy tất cả môn học - ai cũng xem được (cần đăng nhập)
router.get('/', authenticate, getAll);

// Lấy 1 môn học theo id
router.get('/:id', authenticate, getById);

// Tạo môn học - chỉ admin và teacher
router.post('/', authenticate, authorize('admin', 'teacher'), create);

// Cập nhật môn học - chỉ admin và teacher
router.put('/:id', authenticate, authorize('admin', 'teacher'), update);

// Xóa môn học - chỉ admin
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;