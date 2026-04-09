const Result = require('../models/result.model');
const Exam = require('../models/exam.model');

const submit = async ({ examId, userId, answers }) => {
  const exam = await Exam.findById(examId).populate('questions');
  if (!exam) throw new Error('Không tìm thấy đề thi');

  const total = exam.questions.length;
  let correct = 0;

  exam.questions.forEach((q, index) => {
    const studentAnswer = String(answers[index] || '').trim();
    const correctAnswer = String(q.correctAnswer || '').trim();
    if (studentAnswer === correctAnswer) correct++;
  });

  const score = total > 0 ? Math.round((correct / total) * 10 * 10) / 10 : 0;

  const result = await Result.create({
    exam: examId,
    student: userId,
    answers,
    score,
    totalCorrect: correct,
    totalQuestions: total,
    submittedAt: new Date(),
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