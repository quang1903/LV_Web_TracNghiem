const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/classroom.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

router.get('/', authenticate, getAll);
router.post('/', authenticate, authorize('admin', 'teacher'), create);



// Kiểm tra mã mời
router.get('/check-code/:code', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const classroom = await Classroom.findOne({ inviteCode: req.params.code })
            .populate('teacher', 'name');
        if (!classroom) return res.status(404).json({ success: false, message: 'Mã mời không hợp lệ' });
        res.json({
            success: true, data: {
                class_name: classroom.name,
                teacher_name: classroom.teacher?.name,
                student_count: classroom.students?.length || 0
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


// Tham gia lớp
router.post('/join-class', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const classroom = await Classroom.findOne({ inviteCode: req.body.invite_code });
        if (!classroom) return res.status(404).json({ success: false, message: 'Mã mời không hợp lệ' });

        if (classroom.students.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Bạn đã tham gia lớp này rồi' });
        }

        classroom.students.push(req.user.id);
        await classroom.save();

        res.json({ success: true, message: 'Tham gia lớp thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/my-classes', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const classrooms = await Classroom.find({ students: req.user.id })
            .populate('teacher', 'name email')
            .populate('students', 'name email');
        res.json({ success: true, data: classrooms });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.delete('/leave/:id', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const classroom = await Classroom.findByIdAndUpdate(
            req.params.id,
            { $pull: { students: req.user.id } },
            { new: true }
        );
        if (!classroom) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });
        res.json({ success: true, message: 'Rời lớp thành công' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

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

router.put('/:id', authenticate, authorize('admin', 'teacher'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);


router.get('/:id/invite-code', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });
        res.json({ success: true, data: { invite_code: classroom.inviteCode } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/:id/regenerate-code', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const classroom = await Classroom.findByIdAndUpdate(
            req.params.id,
            { inviteCode: newCode },
            { new: true }
        );
        res.json({ success: true, data: { invite_code: classroom.inviteCode } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Lấy học sinh trong lớp
router.get('/:id/students', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const classroom = await Classroom.findById(req.params.id)
            .populate('students', 'name email');
        if (!classroom) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });
        res.json({ success: true, data: classroom.students });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Lấy bài thi đã giao
router.get('/:id/exams', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const classroom = await Classroom.findById(req.params.id)
            .populate({ path: 'exams', populate: { path: 'subject', select: 'name' } });
        res.json({ success: true, data: classroom.exams || [] });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Giao bài thi
router.post('/:id/assign-exam', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const classroom = await Classroom.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { exams: req.body.exam_id } },
            { new: true }
        );
        res.json({ success: true, data: classroom });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Xóa bài thi khỏi lớp
router.delete('/:id/exams/:examId', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        await Classroom.findByIdAndUpdate(req.params.id, { $pull: { exams: req.params.examId } });
        res.json({ success: true, message: 'Xóa bài thi thành công' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/my-classes', authenticate, async (req, res) => {
    try {
        const Classroom = require('../models/classroom.model');
        const classrooms = await Classroom.find({ students: req.user.id })
            .populate('teacher', 'name email')
            .populate('students', 'name email');
        res.json({ success: true, data: classrooms });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;