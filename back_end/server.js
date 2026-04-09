const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoute = require('./src/routes/auth.route');
const subjectRoute = require('./src/routes/subject.route');
const { errorHandler } = require('./middlewares/error.middleware');
const examRoute = require('./src/routes/exam.route');
const questionRoute = require('./src/routes/question.route');
const resultRoute = require('./src/routes/result.route');
const userRoute = require('./src/routes/user.route');
const classroomRoute = require('./src/routes/classroom.route');
const { authenticate } = require('./middlewares/auth.middleware');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoute);
app.use('/api/subjects', subjectRoute);
app.use('/api/exams', examRoute);
app.use('/api/exams/:examId/questions', questionRoute);
app.use('/api/results', resultRoute);
app.use('/api/exams/:examId/results', resultRoute);
app.use('/api/users', userRoute);
// Thêm route teachers (alias)
app.use('/api/teachers', userRoute);
app.use('/api/classrooms', classroomRoute);
app.use('/api/students', userRoute);
app.use('/api/attempts', resultRoute);
// Student routes
app.use('/api/my-classes', classroomRoute);
app.use('/api/my-attempts', resultRoute);





app.get('/', (req, res) => {
  res.json({ message: 'Server đang chạy!' });
});






// Home dashboard student
app.get('/api/home', authenticate, async (req, res) => {
  try {
    const Result = require('./src/models/result.model');
    const Exam = require('./src/models/exam.model');

    const results = await Result.find({ student: req.user.id })
      .populate({ path: 'exam', populate: { path: 'subject', select: 'name' } })
      .sort({ createdAt: -1 });

    const exams = await Exam.find().populate('subject', 'name');

    const avgScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length * 10) / 10
      : 0;

    const bestScore = results.length > 0
      ? Math.max(...results.map(r => r.score))
      : 0;

    res.json({
      success: true,
      data: {
        stats: {
          total_attempts: results.length,
          completed: results.length,
          avg_score: avgScore,
          best_score: bestScore
        },
        recent_attempts: results.slice(0, 5),
        available_exams: exams.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handler phải đặt cuối cùng
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});