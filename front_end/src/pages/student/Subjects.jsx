// src/pages/student/Subjects.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const Subjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Refresh khi focus vào trang
  useEffect(() => {
    const handleFocus = () => {
      fetchSubjects();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách bài thi của sinh viên (đã có has_submitted)
      const examsRes = await axiosClient.get('/exams');
      const allExams = examsRes.data?.data || [];
      
      // Lọc bài thi đã published
      const publishedExams = allExams.filter(exam => exam.status === 'published');
      
      // Lấy danh sách môn học
      const subjectsRes = await axiosClient.get('/subjects');
      let allSubjects = subjectsRes.data?.data || subjectsRes.data || [];
      
      // Lọc môn học có bài thi
      const subjectIds = [...new Set(publishedExams.map(e => e.subject_id))];
      const filteredSubjects = allSubjects.filter(sub => subjectIds.includes(sub.id));
      
      // Thêm số lượng bài thi và trạng thái
      const subjectsWithData = filteredSubjects.map(sub => {
        const subjectExams = publishedExams.filter(e => e.subject_id === sub.id);
        const examCount = subjectExams.length;
        const hasUnfinished = subjectExams.some(e => !e.has_submitted);
        
        return {
          ...sub,
          exams_count: examCount,
          has_unfinished: hasUnfinished
        };
      });
      
      setSubjects(subjectsWithData);
      
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subjectId) => {
    navigate(`/student/subjects/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📚 Danh sách môn học</h1>
      
      {subjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-2">Chưa có môn học nào</p>
          <p className="text-sm text-gray-400">Vui lòng tham gia lớp học để xem bài thi</p>
          <button
            onClick={() => navigate('/student/join')}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            🔑 Tham gia lớp bằng mã mời
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(sub => (
            <div
              key={sub.id}
              onClick={() => handleSubjectClick(sub.id)}
              className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="font-semibold text-lg text-gray-800">{sub.name}</h3>
              {sub.description && (
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{sub.description}</p>
              )}
              <div className="mt-3 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-400">
                    📝 {sub.exams_count || 0} bài thi
                  </span>
                  {sub.has_unfinished ? (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      ⚠️ Chưa làm
                    </span>
                  ) : sub.exams_count > 0 ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      ✓ Đã hoàn thành
                    </span>
                  ) : null}
                </div>
                <span className="text-blue-600 text-sm">Xem chi tiết →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;