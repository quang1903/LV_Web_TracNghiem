const Result = require('../models/result.model');
const Exam = require('../models/exam.model');

const submit = async ({ examId, userId, answers }) => {
  const exam = await Exam.findById(examId).populate('questions');
  if (!exam) throw new Error('Không tìm thấy đề thi');

  // Chấm điểm
  let correct = 0;
  exam.questions.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) correct++;
  });

  const total = exam.questions.length;
  const score = total > 0 ? Math.round((correct / total) * 10 * 10) / 10 : 0;

  const result = await Result.create({
    exam: examId,
    student: userId,       // đổi user → student
    answers,
    score,
    totalCorrect: correct, // đổi correctCount → totalCorrect
    totalQuestions: total,
  });

  return result;
};

const getByUser = async (userId) => {
  return await Result.find({ student: userId })  // đổi user → student
    .populate('exam', 'title duration')
    .sort({ createdAt: -1 });
};

const getByExam = async (examId) => {
  return await Result.find({ exam: examId })
    .populate('student', 'name email')  // đổi user → student
    .sort({ score: -1 });
};

module.exports = { submit, getByUser, getByExam };