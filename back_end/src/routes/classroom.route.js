const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/classroom.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.get('/', authenticate, getAll);
router.post('/', authenticate, authorize('admin', 'teacher'), create);
router.put('/:id', authenticate, authorize('admin', 'teacher'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

router.get('/:id', authenticate, async (req, res) => {
  try {
    const Classroom = require('../models/classroom.model');
    const classroom = await Classroom.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email');
    if (!classroom) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });
    res.json({ success: true, data: classroom });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;