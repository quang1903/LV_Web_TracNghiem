const express = require('express');
const router = express.Router({ mergeParams: true });
const { submit, getByUser, getByExam } = require('../controllers/result.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

// Nộp bài - student
router.post('/submit', authenticate, authorize('student'), submit);

// Xem kết quả của mình
router.get('/my-results', authenticate, getByUser);

// Xem kết quả theo đề thi - teacher/admin
router.get('/exam/:examId', authenticate, authorize('admin', 'teacher'), getByExam);

module.exports = router;