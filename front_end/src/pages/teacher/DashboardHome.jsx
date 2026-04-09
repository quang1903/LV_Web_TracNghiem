// src/pages/teacher/DashboardHome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_exams: 0, published_exams: 0, draft_exams: 0, total_attempts: 0 });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/exams');
      const examsData = res.data?.data || res.data || [];
      setStats({
        total_exams: examsData.length,
        published_exams: examsData.filter(e => e.status === 'published').length,
        draft_exams: examsData.filter(e => e.status === 'draft').length,
        total_attempts: examsData.reduce((sum, e) => sum + (e.attempts_count || 0), 0),
      });
      setRecentExams(examsData.slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">🏠 Tổng quan</h1>

      {/* Stat cards: 2 cols on mobile, 4 on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tổng bài thi',  value: stats.total_exams,    colors: 'from-blue-500 to-blue-600' },
          { label: 'Đã xuất bản',   value: stats.published_exams, colors: 'from-green-500 to-green-600' },
          { label: 'Nháp',          value: stats.draft_exams,     colors: 'from-yellow-500 to-yellow-600' },
          { label: 'Lượt làm bài',  value: stats.total_attempts,  colors: 'from-purple-500 to-purple-600' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.colors} text-white p-3 sm:p-4 rounded-lg`}>
            <p className="text-xs opacity-90 leading-tight">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Two panels — stacked on mobile, side-by-side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-base font-semibold mb-3">📝 Bài thi gần đây</h2>
          {recentExams.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">Chưa có bài thi nào</p>
          ) : (
            <div className="space-y-2">
              {recentExams.map(exam => (
                <div key={exam.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{exam.title}</p>
                    <p className="text-xs text-gray-500">{exam.subject?.name}</p>
                  </div>
                  <button
  onClick={() => navigate(`/teacher/exams`)}
  className="text-blue-600 hover:text-blue-800 text-xs flex-shrink-0"
>
  Sửa
</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-base font-semibold mb-3">⚡ Hành động nhanh</h2>
          <div className="space-y-2">
            {[
              { label: '📚 Quản lý môn học',  path: '/teacher/subjects' },
              { label: '📝 Quản lý bài thi',  path: '/teacher/exams' },
              { label: '❓ Quản lý câu hỏi',  path: '/teacher/questions' },
              { label: '👥 Quản lý lớp học',  path: '/teacher/classes' },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)}
                className="w-full text-left px-3 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm transition">
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;