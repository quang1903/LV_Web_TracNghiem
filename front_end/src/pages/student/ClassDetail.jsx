// src/pages/student/ClassDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [exams, setExams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('exams');

  useEffect(() => {
    if (id) fetchClassDetail();
  }, [id]);

  const fetchClassDetail = async () => {
    try {
      const res = await axiosClient.get(`/classrooms/${id}`);
      const data = res.data?.data;
      setClassData(data);

      // Lấy bài thi đã được mở
      const publishedExams = (data?.exams || []).filter(
        (exam) => exam.status === 'published'
      );
      setExams(publishedExams);
      setMembers(data?.students || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Không thể tải thông tin lớp');
      navigate('/student/classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!classData) return null;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{classData.name}</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Giảng viên: {classData.teacher?.name}
            </p>
            {classData.description && (
              <p className="text-gray-600 mt-2 text-sm sm:text-base">{classData.description}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-xs sm:text-sm text-gray-500">
              <span>📚 {exams.length} bài kiểm tra mở</span>
              <span>👥 {members.length} học viên</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/classes')}
            className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6 flex-wrap">
          <button
            onClick={() => setActiveTab('exams')}
            className={`pb-2 px-1 font-medium ${
              activeTab === 'exams'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bài kiểm tra
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-2 px-1 font-medium ${
              activeTab === 'members'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Thành viên ({members.length})
          </button>
        </div>
      </div>

      {/* Nội dung */}
      {activeTab === 'exams' ? (
        <div className="space-y-4">
          {exams.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">Chưa có bài kiểm tra nào đang mở</p>
            </div>
          ) : (
            exams.map((exam) => {
              const isFinished =
                exam.attempt_limit && exam.attempt_count >= exam.attempt_limit;
              const hasAttempted = exam.attempt_count > 0;

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-blue-600">{exam.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {exam.description || 'Không có mô tả'}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      <span>⏱️ {exam.duration} phút</span>
                      <span>📝 {exam.questions_count || 0} câu hỏi</span>
                      {exam.attempt_limit && (
                        <>
                          <span>Số lần đã làm: {exam.attempt_count}</span>
                          <span>
                            Số lượt còn lại: {Math.max(exam.attempt_limit - exam.attempt_count, 0)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    {(isFinished || hasAttempted) && exam.attempt_id ? (
                      <button
                        onClick={() => navigate(`/student/result/${exam.attempt_id}`)}
                        className="px-4 py-2 rounded text-sm bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                      >
                        Xem kết quả
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/student/exams/${exam.id}`)}
                        className="px-4 py-2 rounded text-sm bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                      >
                        Làm bài
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">STT</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Học viên</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Mã sinh viên</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member, index) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-gray-500">{index + 1}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 truncate">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-gray-600 font-mono">{member.student_code || 'Chưa có mã'}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 truncate">{member.email}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(member.pivot?.created_at || member.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;