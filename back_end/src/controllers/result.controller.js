const resultService = require('../services/result.service');

const submit = async (req, res) => {
  try {
    const result = await resultService.submit({
      examId: req.params.examId,
      userId: req.user.id,
      answers: req.body.answers,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getByUser = async (req, res) => {
  try {
    const results = await resultService.getByUser(req.user.id);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getByExam = async (req, res) => {
  try {
    const results = await resultService.getByExam(req.params.examId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { submit, getByUser, getByExam };