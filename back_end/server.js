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

app.get('/', (req, res) => {
  res.json({ message: 'Server đang chạy!' });
});

// Error handler phải đặt cuối cùng
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});