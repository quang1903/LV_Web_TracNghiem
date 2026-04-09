// src/pages/student/SubjectExams.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const SubjectExams = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  // Refresh khi focus
  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách bài thi của sinh viên
      const examsRes = await axiosClient.get('/exams');
      const allExams = examsRes.data?.data || [];
      
      // Lọc bài thi theo môn học và published
      const subjectExams = allExams.filter(e => e.subject_id == id && e.status === 'published');
      
      // Lấy thông tin môn học
      const subjectsRes = await axiosClient.get(`/subjects/${id}`);
      setSubject(subjectsRes.data?.data || subjectsRes.data);
      setExams(subjectExams);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;
  if (!subject) return <div className="text-center py-10">Không tìm thấy môn học</div>;

  return (
    <div>
      <button onClick={() => navigate('/student/subjects')} className="text-blue-600 mb-4 inline-block">
        ← Quay lại danh sách môn học
      </button>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{subject.name}</h1>
      {subject.description && <p className="text-gray-500 mb-6">{subject.description}</p>}
      
      {exams.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Chưa có bài thi nào cho môn học này</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">{exam.title}</h3>
                <p className="text-sm text-gray-500">{exam.duration} phút</p>
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

export default SubjectExams;