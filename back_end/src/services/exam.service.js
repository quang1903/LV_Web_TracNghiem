const Exam = require('../models/exam.model');

const getAll = async () => {
  return await Exam.find()
    .populate('subject', 'name')
    .populate('createdBy', 'name email');
};

const getById = async (id) => {
  const exam = await Exam.findById(id)
    .populate('subject', 'name')
    .populate('questions');
  if (!exam) throw new Error('Không tìm thấy đề thi');
  return exam;
};

const create = async ({ title, subject, duration, totalQuestions, startTime, endTime, userId }) => {
  return await Exam.create({
    title,
    subject,
    duration,
    totalQuestions,
    startTime,
    endTime,
    createdBy: userId,
  });
};

const update = async (id, data) => {
  const exam = await Exam.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!exam) throw new Error('Không tìm thấy đề thi');
  return exam;
};

const remove = async (id) => {
  const exam = await Exam.findByIdAndDelete(id);
  if (!exam) throw new Error('Không tìm thấy đề thi');
  return exam;
};

module.exports = { getAll, getById, create, update, remove };