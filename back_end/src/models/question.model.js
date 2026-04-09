const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Nội dung câu hỏi không được để trống'],
      trim: true,
    },
    options: {
      type: [String], // mảng 4 đáp án
      required: [true, 'Đáp án không được để trống'],
      validate: {
        validator: (v) => v.length === 4,
        message: 'Phải có đúng 4 đáp án',
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Đáp án đúng không được để trống'],
      min: 0,
      max: 3, // index 0-3 tương ứng 4 đáp án
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Môn học không được để trống'],
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