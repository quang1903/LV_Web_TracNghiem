const questionService = require('../services/question.service');

const getByExam = async (req, res) => {
  try {
    const questions = await questionService.getByExam(req.params.examId);
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const question = await questionService.create({
      ...req.body,
      examId: req.params.examId,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const question = await questionService.update(req.params.id, req.body);
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await questionService.remove(req.params.id);
    res.json({ success: true, message: 'Xóa câu hỏi thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getByExam, create, update, remove };