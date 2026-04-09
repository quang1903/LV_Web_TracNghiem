const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/exam.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.get('/', authenticate, getAll);
router.post('/', authenticate, authorize('admin', 'teacher'), create);

// Đặt route cụ thể TRƯỚC route có params
router.patch('/:id/status', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const Exam = require('../models/exam.model');
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id', authenticate, getById);
router.put('/:id', authenticate, authorize('admin', 'teacher'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;