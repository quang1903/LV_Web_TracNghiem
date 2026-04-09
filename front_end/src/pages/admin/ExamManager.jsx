// src/pages/admin/ExamManager.jsx
import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const ExamManager = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTeacher, setSearchTeacher] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, subjectsRes, teachersRes] = await Promise.all([
        axiosClient.get('/exams'),
        axiosClient.get('/subjects'),
        axiosClient.get('/teachers')
      ]);
      setExams(examsRes.data?.data || examsRes.data || []);
      setSubjects(subjectsRes.data?.data || subjectsRes.data || []);
      setTeachers(teachersRes.data?.data || teachersRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa bài thi "${title}"?`)) return;
    try {
      await axiosClient.delete(`/exams/${id}`);
      alert('Xóa thành công!');
      fetchData();
    } catch (error) {
      if (error.response?.status === 400) {
        const data = error.response.data;
        let msg = `Không thể xóa bài thi "${title}"\n\n`;
        if (data.related_items?.questions) msg += `📝 ${data.related_items.questions.count} câu hỏi\n`;
        if (data.related_items?.attempts) msg += `👨‍🎓 ${data.related_items.attempts.count} lượt làm\n`;
        alert(msg);
      } else {
        alert(error.response?.data?.message || 'Lỗi xóa');
      }
    }
  };

  const getStatusBadge = (status) => {
    const config = { published: 'bg-green-100', draft: 'bg-yellow-100', closed: 'bg-red-100' };
    const texts = { published: 'Đã xuất bản', draft: 'Nháp', closed: 'Đã đóng' };
    return <span className={`px-2 py-1 text-xs rounded-full ${config[status]}`}>{texts[status]}</span>;
  };

  const getSubjectsByTeacher = () => {
    if (!searchTeacher) return subjects;
    const teacherExams = exams.filter(e => {
      const t = teachers.find(t => t.id === e.created_by);
      return t?.name?.toLowerCase().includes(searchTeacher.toLowerCase());
    });
    const subjectIds = [...new Set(teacherExams.map(e => e.subject_id))];
    return subjects.filter(s => subjectIds.includes(s.id));
  };

  const availableSubjects = getSubjectsByTeacher();

  const filteredExams = exams.filter(e => {
    if (searchTeacher) {
      const t = teachers.find(t => t.id === e.created_by);
      if (!t?.name?.toLowerCase().includes(searchTeacher.toLowerCase())) return false;
    }
    if (filterSubject && e.subject_id != filterSubject) return false;
    return true;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentExams = filteredExams.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    if (filterSubject && !availableSubjects.some(s => s.id == filterSubject)) setFilterSubject('');
  }, [searchTeacher]);

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📝 Quản lý bài thi</h1>
        <div className="text-sm text-gray-500">Tổng: {exams.length} bài</div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm theo giảng viên</label>
            <input
              type="text"
              placeholder="Nhập tên giảng viên..."
              value={searchTeacher}
              onChange={(e) => setSearchTeacher(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lọc theo môn học</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={availableSubjects.length === 0 && searchTeacher}
            >
              <option value="">Tất cả môn</option>
              {availableSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách */}
      {currentExams.length === 0 ? (
        <div className="bg-white rounded shadow p-12 text-center text-gray-500">
          {searchTeacher || filterSubject ? 'Không tìm thấy' : 'Không có bài thi'}
        </div>
      ) : (
        <>
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm">STT</th>
                  <th className="px-4 py-3 text-left text-sm">Tiêu đề</th>
                  <th className="px-4 py-3 text-left text-sm">Môn học</th>
                  <th className="px-4 py-3 text-left text-sm">Giảng viên</th>
                  <th className="px-4 py-3 text-left text-sm">Thời gian</th>
                  <th className="px-4 py-3 text-left text-sm">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentExams.map((exam, idx) => {
                  const teacher = teachers.find(t => t.id === exam.created_by);
                  return (
                    <tr key={exam.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{indexOfFirst + idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{exam.title}</div>
                        {exam.description && <div className="text-xs text-gray-500">{exam.description}</div>}
                      </td>
                      <td className="px-4 py-3">{exam.subject?.name || '—'}</td>
                      <td className="px-4 py-3">{teacher?.name || '—'}</td>
                      <td className="px-4 py-3">{exam.duration} phút</td>
                      <td className="px-4 py-3">{getStatusBadge(exam.status)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(exam.id, exam.title)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm"
              >
                «
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
                           <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm"
              >
                »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExamManager;