const express = require('express');
const router = express.Router({ mergeParams: true });
const { submit, getByUser, getByExam } = require('../controllers/result.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.get('/', authenticate, getByUser);
router.post('/submit', authenticate, authorize('student'), submit);
router.get('/my-results', authenticate, getByUser);
router.get('/exam/:examId', authenticate, authorize('admin', 'teacher'), getByExam);
router.get('/my-attempts', authenticate, getByUser);

// Lấy kết quả theo id
router.get('/:resultId', authenticate, async (req, res) => {
  try {
    const Result = require('../models/result.model');
    const result = await Result.findById(req.params.resultId)
      .populate({ path: 'exam', populate: { path: 'subject', select: 'name' } });
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy kết quả' });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;