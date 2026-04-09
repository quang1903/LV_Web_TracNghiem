const Subject = require('../models/subject.model');

const getAll = async () => {
  return await Subject.find().populate('createdBy', 'name email');
};

const getById = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) throw new Error('Không tìm thấy môn học');
  return subject;
};

const create = async ({ name, description, userId }) => {
  const existing = await Subject.findOne({ name });
  if (existing) throw new Error('Môn học đã tồn tại');
  return await Subject.create({ name, description, createdBy: userId });
};

const update = async (id, { name, description }) => {
  const subject = await Subject.findByIdAndUpdate(
    id,
    { name, description },
    { new: true, runValidators: true }
  );
  if (!subject) throw new Error('Không tìm thấy môn học');
  return subject;
};

const remove = async (id) => {
  const subject = await Subject.findByIdAndDelete(id);
  if (!subject) throw new Error('Không tìm thấy môn học');
  return subject;
};

module.exports = { getAll, getById, create, update, remove };