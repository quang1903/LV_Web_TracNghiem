const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Đề thi không được để trống'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    content: {
      type: String,
      required: [true, 'Nội dung câu hỏi không được để trống'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Đáp án không được để trống'],
      validate: {
        validator: (v) => v.length === 4,
        message: 'Phải có đúng 4 đáp án',
      },
    },
    correctAnswer: {
      type: String,
      required: [true, 'Đáp án đúng không được để trống'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
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

module.exports = mongoose.model('Question', questionSchema);