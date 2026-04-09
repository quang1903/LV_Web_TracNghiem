// src/pages/student/ExamResult.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const res = await axiosClient.get(`/attempts/${attemptId}/result`);
      setResult(res.data?.data || res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;
  if (!result) return <div className="text-center py-10 text-red-500">Không tìm thấy kết quả</div>;

  const remainingAttempts = (result.max_attempts || 1) - (result.attempt_number || 1);
  const canRetake = remainingAttempts > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{result.exam_title}</h2>
        <p className="text-gray-600 mb-6">{result.subject_name}</p>
        
        <div className="inline-block p-6 bg-blue-50 rounded-full mb-4">
          <div className="text-5xl font-bold text-blue-600">{result.score}</div>
          <div className="text-sm text-gray-500">điểm</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Số câu đúng</p>
            <p className="text-xl font-bold text-green-600">{result.correct_answers}/{result.total_questions}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Thời gian</p>
            <p className="text-xl font-bold text-blue-600">
              {result.time_spent ? Math.floor(result.time_spent / 60) : 0} phút
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Lượt làm</p>
            <p className="text-xl font-bold text-purple-600">
              {result.attempt_number || 1}/{result.max_attempts || 1}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">📝 Chi tiết câu hỏi</h3>
        {result.questions?.map((q, idx) => (
          <div key={q.id} className={`bg-white rounded-xl shadow p-5 border-l-4 ${q.is_correct ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {q.is_correct ? <span className="text-green-500 text-xl">✓</span> : <span className="text-red-500 text-xl">✗</span>}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-3">Câu {idx + 1}: {q.content}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Đáp án của bạn:</span>{' '}
                    <span className={q.is_correct ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {q.user_answer || 'Chưa trả lời'}
                    </span>
                  </p>
                  {!q.is_correct && q.correct_answer && (
                    <p className="text-green-600">
                      <span className="font-medium">Đáp án đúng:</span> {q.correct_answer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex gap-4">
        <button onClick={() => navigate('/student')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          Về trang chủ
        </button>
        <button onClick={() => navigate('/student/exams')} className="flex-1 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700">
          Danh sách bài thi
        </button>
        {canRetake && (
          <button 
            onClick={() => navigate(`/student/exams/${result.exam_id}`)} 
            className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            Làm lại (còn {remainingAttempts} lượt)
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamResult;