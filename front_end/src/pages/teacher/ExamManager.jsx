import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const ExamManager = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterSubjectId = searchParams.get('subject_id');

  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject_id: filterSubjectId || '',
    duration: 30,
    max_attempts: 1,
    status: 'draft',
    start_time: '',
    end_time: '',
  });
  const [userRole, setUserRole] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(filterSubjectId || '');

  // fetch user role
  useEffect(() => {
    axiosClient.get('/me')
      .then(res => setUserRole(res.data?.data?.role || 'teacher'))
      .catch(() => setUserRole('teacher'));
  }, []);

  // fetch subjects & exams
  useEffect(() => {
    if (!userRole) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subRes, examRes] = await Promise.all([
          axiosClient.get('/subjects'),
          axiosClient.get(`/exams${selectedSubjectId ? `?subject_id=${selectedSubjectId}` : ''}`)
        ]);

        let subData = subRes.data?.data || [];
        if (userRole === 'teacher') subData = subRes.data?.assigned || subData;
        setSubjects(subData);

        setExams(examRes.data?.data || []);
      } catch (err) {
        console.error(err);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userRole, selectedSubjectId]);

  // open modal for create/edit
  const openModal = (exam = null) => {
    setEditingExam(exam);
    setFormData(exam ? {
      title: exam.title || '',
      subject_id: exam.subject_id || selectedSubjectId || '',
      duration: exam.duration || 30,
      max_attempts: exam.max_attempts || 1,
      status: exam.status || 'draft',
      start_time: exam.start_time ? exam.start_time.slice(0,16) : '',
      end_time: exam.end_time ? exam.end_time.slice(0,16) : '',
    } : {
      title: '',
      subject_id: selectedSubjectId || '',
      duration: 30,
      max_attempts: 1,
      status: 'draft',
      start_time: '',
      end_time: '',
    });
    setShowModal(true);
  };

  // create/update exam
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        const res = await axiosClient.put(`/exams/${editingExam.id}`, formData);
        setExams(exams.map(ex => ex.id === editingExam.id ? res.data.data : ex));
        alert('Cập nhật thành công');
      } else {
        const res = await axiosClient.post('/exams', formData);
        setExams([res.data.data, ...exams]);
        alert('Tạo bài thi thành công');
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi tạo/cập nhật bài thi');
    }
  };

  // delete exam
  const handleDelete = async (exam) => {
    try {
      const confirmMsg = `Bạn có chắc muốn xóa bài thi "${exam.title}"?`;
      if (!window.confirm(confirmMsg)) return;

      let res = await axiosClient.delete(`/exams/${exam.id}`);
      if (!res.data.success && res.data.force_required) {
        const force = window.confirm(res.data.warnings.join('\n') + '\n\nXóa ngay?');
        if (!force) return;
        res = await axiosClient.delete(`/exams/${exam.id}?force=true`);
      }

      if (res.data.success) {
        setExams(exams.filter(ex => ex.id !== exam.id));
        alert('Xóa thành công');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi xóa bài thi');
    }
  };

  // update exam status
  const handleStatusChange = async (id, status) => {
    try {
      const res = await axiosClient.patch(`/exams/${id}/status`, { status });
      setExams(exams.map(ex => ex.id === id ? res.data.data : ex));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  if (loading || !userRole) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">📝 Quản lý bài thi</h1>
        <div className="flex gap-2">
          {userRole === 'admin' && (
            <button
              onClick={() => navigate('/admin/subjects/create')}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >Tạo môn</button>
          )}
          <button
            onClick={() => openModal()}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >Tạo bài thi</button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={selectedSubjectId}
          onChange={e => setSelectedSubjectId(e.target.value)}
          className="w-full px-2 py-2 border rounded"
        >
          <option value="">Tất cả môn học</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Exam list */}
      {exams.length === 0 ? (
        <div className="bg-white p-5 text-center text-gray-500 rounded shadow">Chưa có bài thi nào</div>
      ) : (
        <table className="w-full text-sm bg-white rounded shadow overflow-x-auto">
          <thead className="bg-gray-50 text-gray-500 uppercase">
            <tr>
              {['Tiêu đề','Môn học','TG','Lần thi','Trạng thái','Hành động'].map(h => (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exams.map(ex => (
              <tr key={ex.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{ex.title}</td>
                <td className="px-4 py-2">{ex.subject?.name || '-'}</td>
                <td className="px-4 py-2">{ex.duration}p</td>
                <td className="px-4 py-2">{ex.max_attempts || 1}</td>
                <td className="px-4 py-2">
                  <select
                    value={ex.status}
                    onChange={e => handleStatusChange(ex.id, e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Xuất bản</option>
                    <option value="closed">Đóng</option>
                  </select>
                </td>
                <td className="px-4 py-2 flex gap-1">
                  <button
                    onClick={() => navigate(`/teacher/questions?exam_id=${ex.id}`)}
                    className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                  >Câu hỏi</button>
                  <button
                    onClick={() => openModal(ex)}
                    className="px-2 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-600"
                  >Sửa</button>
                  <button
                    onClick={() => handleDelete(ex)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingExam ? 'Sửa bài thi' : 'Tạo bài thi'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text" placeholder="Tiêu đề" value={formData.title}
                onChange={e => setFormData({...formData,title:e.target.value})} className="w-full border rounded px-3 py-2" required
              />
              <select
                value={formData.subject_id} onChange={e => setFormData({...formData,subject_id:e.target.value})}
                className="w-full border rounded px-3 py-2" required
              >
                <option value="">Chọn môn học</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="number" placeholder="Thời gian (phút)" value={formData.duration}
                  onChange={e=>setFormData({...formData,duration:Math.max(1,parseInt(e.target.value)||30)})}
                  className="w-1/2 border rounded px-3 py-2" required
                />
                <input type="number" placeholder="Số lần thi" value={formData.max_attempts}
                  onChange={e=>setFormData({...formData,max_attempts:Math.min(10,Math.max(1,parseInt(e.target.value)||1))})}
                  className="w-1/2 border rounded px-3 py-2" required
                />
              </div>
              <div className="flex gap-2">
                <input type="datetime-local" placeholder="Bắt đầu" value={formData.start_time}
                  onChange={e=>setFormData({...formData,start_time:e.target.value})} className="w-1/2 border rounded px-3 py-2"
                />
                <input type="datetime-local" placeholder="Kết thúc" value={formData.end_time}
                  onChange={e=>setFormData({...formData,end_time:e.target.value})} className="w-1/2 border rounded px-3 py-2"
                />
              </div>
              <select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})} className="w-full border rounded px-3 py-2">
                <option value="draft">Nháp</option>
                <option value="published">Xuất bản</option>
                <option value="closed">Đóng</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">{editingExam?'Cập nhật':'Tạo'}</button>
                <button type="button" onClick={()=>setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManager;