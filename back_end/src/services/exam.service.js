const Exam = require('../models/exam.model');

const getAll = async (userId) => {
  const exams = await Exam.find()
    .populate('subject', 'name')
    .populate('createdBy', 'name email');

  // Thêm thông tin cho từng bài thi
  const Result = require('../models/result.model');
  
  const examsWithInfo = await Promise.all(exams.map(async (exam) => {
    const examObj = exam.toObject();
    
    if (userId) {
      const results = await Result.find({ 
        exam: exam._id, 
        student: userId 
      });
      
      examObj.has_submitted = results.length > 0;
      examObj.attempt_count = results.length;
      examObj.can_take = true;
      examObj.score = results.length > 0 ? results[results.length - 1].score : null;
    }
    
    return examObj;
  }));

  return examsWithInfo;
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

const getById = async (id) => {
  const exam = await Exam.findById(id)
    .populate('subject', 'name')
    .populate('questions');
  if (!exam) throw new Error('Không tìm thấy đề thi');
  return exam;
};

module.exports = { getAll, getById, create, update, remove };