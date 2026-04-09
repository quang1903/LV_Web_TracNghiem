const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tên đề thi không được để trống'],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Môn học không được để trống'],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    duration: {
      type: Number,
      required: [true, 'Thời gian thi không được để trống'],
      min: [1, 'Thời gian thi phải lớn hơn 0'],
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Số câu hỏi không được để trống'],
    },
    startTime: {
      type: Date,
      required: [true, 'Thời gian bắt đầu không được để trống'],
    },
    endTime: {
      type: Date,
      required: [true, 'Thời gian kết thúc không được để trống'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exam', examSchema);