const Classroom = require('../models/classroom.model');

const getAll = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate('teacher', 'name email')
      .populate('students', 'name email');
    res.json({ success: true, data: classrooms });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const classroom = await Classroom.create({ ...req.body, inviteCode });
    res.status(201).json({ success: true, data: classroom });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!classroom) throw new Error('Không tìm thấy lớp học');
    res.json({ success: true, data: classroom });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await Classroom.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Xóa lớp thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, create, update, remove };