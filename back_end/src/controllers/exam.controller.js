const examService = require('../services/exam.service');

const getAll = async (req, res) => {
  try {
    const exams = await examService.getAll(req.user?.id);
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const exam = await examService.getById(req.params.id);
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const exam = await examService.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const exam = await examService.update(req.params.id, req.body);
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await examService.remove(req.params.id);
    res.json({ success: true, message: 'Xóa đề thi thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };