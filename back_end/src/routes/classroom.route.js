const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/classroom.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.get('/', authenticate, getAll);
router.post('/', authenticate, authorize('admin', 'teacher'), create);
router.put('/:id', authenticate, authorize('admin', 'teacher'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;