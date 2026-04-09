const Question = require('../models/question.model');

const getByExam = async (examId) => {
  return await Question.find({ exam: examId });
};

const create = async ({ examId, content, options, correctAnswer, userId }) => {
  return await Question.create({
    exam: examId,
    content,
    options,
    correctAnswer,
    createdBy: userId,
  });
};

const update = async (id, data) => {
  const question = await Question.findByIdAndUpdate(id, data, { new: true });
  if (!question) throw new Error('Không tìm thấy câu hỏi');
  return question;
};

const remove = async (id) => {
  const question = await Question.findByIdAndDelete(id);
  if (!question) throw new Error('Không tìm thấy câu hỏi');
  return question;
};

module.exports = { getByExam, create, update, remove };