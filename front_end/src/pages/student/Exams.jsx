// src/pages/student/Exams.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const Exams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchExams();
  }, []);

  // Refresh khi focus vào trang
  useEffect(() => {
    const handleFocus = () => {
      fetchExams();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/exams');
      const data = res.data?.data || [];
      
      // Sắp xếp bài thi mới nhất lên đầu
      const sortedExams = [...data].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setExams(sortedExams);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    if (filter === 'all') return true;
    if (filter === 'completed') return exam.has_submitted;
    if (filter === 'pending') return !exam.has_submitted && exam.status === 'published';
    return exam.status === filter;
  });

  const stats = {
    all: exams.length,
    completed: exams.filter(e => e.has_submitted).length,
    pending: exams.filter(e => !e.has_submitted && e.status === 'published').length,
    published: exams.filter(e => e.status === 'published').length
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📝 Danh sách bài thi</h1>
      
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          Tất cả ({stats.all})
        </button>
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
          Chưa làm ({stats.pending})
        </button>
        <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded ${filter === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
          Đã làm ({stats.completed})
        </button>
        <button onClick={() => setFilter('published')} className={`px-4 py-2 rounded ${filter === 'published' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          Đang mở ({stats.published})
        </button>
      </div>
      
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Không có bài thi nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExams.map(exam => (
            <div key={exam.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">{exam.title}</h3>
                <p className="text-sm text-gray-500">{exam.subject?.name} • {exam.duration} phút</p>
                <div className="flex flex-wrap gap-3 mt-1">
                  {exam.has_submitted && (
                    <p className="text-xs text-green-600">✓ Đã làm • Điểm: {exam.score}</p>
                  )}
                  <p className="text-xs text-blue-600">
                    🔄 Đã làm: {exam.attempt_count}/{exam.max_attempts} lần
                    {exam.remaining_attempts > 0 && ` (còn ${exam.remaining_attempts} lượt)`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {exam.has_submitted && exam.attempt_id && (
                  <button
                    onClick={() => navigate(`/student/result/${exam.attempt_id}`)}
                    className="px-4 py-2 rounded text-sm bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Xem kết quả
                  </button>
                )}
                {exam.can_take && (
                  <button
                    onClick={() => navigate(`/student/exams/${exam.id}`)}
                    className="px-4 py-2 rounded text-sm bg-green-600 hover:bg-green-700 text-white"
                  >
                    {exam.has_submitted ? 'Làm lại' : 'Vào thi'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Exams;