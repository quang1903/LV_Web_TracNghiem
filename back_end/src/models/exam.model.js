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
  default: 0,
},
    // startTime: {
    //   type: Date,
    //   required: [true, 'Thời gian bắt đầu không được để trống'],
    // },
    // endTime: {
    //   type: Date,
    //   required: [true, 'Thời gian kết thúc không được để trống'],
    // },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
  type: String,
  enum: ['draft', 'published', 'closed'],
  default: 'draft',
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