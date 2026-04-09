// src/pages/student/ExamDetail.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);           // Dữ liệu bài thi
  const [answers, setAnswers] = useState({});       // Câu trả lời của học sinh
  const [attemptId, setAttemptId] = useState(null); // ID attempt
  const [timeLeft, setTimeLeft] = useState(null);   // Thời gian còn lại
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const timerRef = useRef(null);

  // === Fetch exam và tạo attempt ===
  useEffect(() => {
    if (!id) return navigate('/student/exams');

    const initExam = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        // 1️⃣ Lấy thông tin bài thi
        const res = await axiosClient.get(`/exams/${id}`);
        const examData = res.data?.data || res.data;

        if (!examData) {
          setErrorMessage('Không tìm thấy bài thi.');
          return;
        }
        setExam(examData);

        // 2️⃣ Khởi tạo answers trống
        const initialAnswers = {};
        examData.questions?.forEach(q => {
          initialAnswers[q.id] = null;
        });
        setAnswers(initialAnswers);

        // 3️⃣ Tạo attempt mới nếu chưa có attempt
        if (!examData.has_submitted) {
          const attemptRes = await axiosClient.post('/attempts', { exam_id: parseInt(id) });
          const attemptData = attemptRes.data?.data || attemptRes.data;
          setAttemptId(attemptData?.id || null);

          // 4️⃣ Khởi tạo timer
          if (examData.duration) startTimer(examData.duration * 60);
        } else {
          // Nếu đã làm thì redirect tới kết quả
          navigate(`/student/result/${examData.attempt_id}`);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(error.response?.data?.message || 'Đã xảy ra lỗi khi tải bài thi.');
      } finally {
        setLoading(false);
      }
    };

    initExam();
    return () => clearInterval(timerRef.current);
  }, [id]);

  // === Timer đếm ngược ===
  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(); // Tự động nộp khi hết giờ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = sec => {
    if (sec === null) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  // === Chọn câu trả lời ===
  const handleAnswerChange = async (questionId, answerId) => {
    if (!attemptId) return;
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));

    try {
      await axiosClient.post(`/attempts/${attemptId}/questions/${questionId}/answer`, { answer_id: answerId });
    } catch (error) {
      console.error('Lỗi lưu câu trả lời:', error);
    }
  };

  // === Nộp bài ===
  const handleSubmit = async () => {
    if (!exam || !attemptId) return;

    const unanswered = exam.questions?.filter(q => !answers[q.id]).length || 0;
    if (unanswered > 0 && !window.confirm(`Bạn còn ${unanswered} câu chưa trả lời. Nộp bài?`)) return;

    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/attempts/${attemptId}/submit`, {
        time_spent: exam.duration ? exam.duration * 60 - (timeLeft || 0) : null
      });
      const attempt = res.data?.data || res.data;
      navigate(`/student/result/${attempt?.id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi nộp bài');
      setSubmitting(false);
    }
  };

  // === Render loading / error ===
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-500">Đang tải bài thi...</span>
    </div>
  );

  if (errorMessage) return (
    <div className="text-center py-20">
      <p className="text-red-500">{errorMessage}</p>
      <button onClick={() => navigate('/student/exams')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Quay lại</button>
    </div>
  );

  if (!exam) return null;

  const totalQuestions = exam.questions?.length || 0;
  const answeredCount = Object.values(answers).filter(a => a !== null).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{exam.title}</h2>
          <p className="text-sm text-gray-500 mt-1">Đã trả lời: {answeredCount}/{totalQuestions} câu</p>
        </div>
        {timeLeft !== null && (
          <div className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-blue-600'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Câu hỏi */}
      <div className="space-y-4">
        {exam.questions?.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-lg shadow p-4">
            <p className="font-medium mb-3">
              <span className="text-blue-600">Câu {idx + 1}:</span> {q.content}
            </p>
            <div className="space-y-2 ml-4">
              {q.answers?.map(a => (
                <label
                  key={a.id}
                  className={`flex items-center p-2 border rounded cursor-pointer transition ${answers[q.id] === a.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={a.id}
                    checked={answers[q.id] === a.id}
                    onChange={() => handleAnswerChange(q.id, a.id)}
                    className="mr-3 w-4 h-4"
                  />
                  <span className="text-gray-700">{a.content}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Nút nộp */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {submitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
        <button
          onClick={() => {
            if (window.confirm('Hủy làm bài? Dữ liệu sẽ không được lưu.')) navigate('/student/exams');
          }}
          className="px-6 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default ExamDetail;