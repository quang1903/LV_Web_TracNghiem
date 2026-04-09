const subjectService = require('../services/subject.service');

const getAll = async (req, res) => {
  try {
    const subjects = await subjectService.getAll();
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const subject = await subjectService.getById(req.params.id);
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const subject = await subjectService.create({ 
      name, 
      description, 
      userId: req.user.id 
    });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const subject = await subjectService.update(req.params.id, req.body);
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await subjectService.remove(req.params.id);
    res.json({ success: true, message: 'Xóa môn học thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };