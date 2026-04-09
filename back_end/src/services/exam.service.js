const Exam = require('../models/exam.model');

const getAll = async (userId, subjectId) => {
  const query = subjectId ? { subject: subjectId } : {};
  
  const exams = await Exam.find(query)
    .populate('subject', 'name')
    .populate('createdBy', 'name email');

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

const create = async (data) => {
  return await Exam.create({
    title: data.title,
    subject: data.subject_id || data.subject,
    duration: data.duration,
    totalQuestions: data.totalQuestions || data.max_attempts || 0,
    createdBy: data.userId,
  });
};

const update = async (id, data) => {
  const exam = await Exam.findByIdAndUpdate(
    id, 
    { subject: data.subject_id || data.subject, ...data },
    { new: true, runValidators: true }
  ).populate('subject', 'name');
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