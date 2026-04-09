const express = require('express');
const router = express.Router({ mergeParams: true });
const { getByExam, create, update, remove } = require('../controllers/question.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.get('/', authenticate, getByExam);
router.post('/', authenticate, authorize('admin', 'teacher'), create);
router.put('/:id', authenticate, authorize('admin', 'teacher'), update);
router.delete('/:id', authenticate, authorize('admin', 'teacher'), remove);

module.exports = router;