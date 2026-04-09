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

module.exports = router;