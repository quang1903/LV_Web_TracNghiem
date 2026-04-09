// src/pages/teacher/ClassManager.jsx
import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const ClassManager = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/classrooms');
      setClassrooms(res.data?.data || []);
    } catch (err) {
      console.error('Lỗi tải lớp học:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Vui lòng nhập tên lớp');
    setSubmitting(true);
    try {
      await axiosClient.post('/classrooms', formData);
      alert('Tạo lớp thành công!');
      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchClassrooms();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể tạo lớp'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Giải tán lớp "${name}"?`)) return;
    try {
      await axiosClient.delete(`/classrooms/${id}`);
      alert('Đã giải tán lớp thành công!');
      fetchClassrooms();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (classroom) => {
    setEditingId(classroom.id);
    setEditData({ name: classroom.name || '', description: classroom.description || '' });
  };

  const handleUpdate = async (id) => {
    if (!editData.name.trim()) return alert('Tên lớp không được để trống');
    try {
      await axiosClient.put(`/classrooms/${id}`, editData);
      alert('Cập nhật lớp thành công');
      setEditingId(null);
      fetchClassrooms();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleChangeInviteCode = async (id) => {
    try {
      const res = await axiosClient.post(`/classrooms/${id}/regenerate-code`);
      alert('Mã lớp mới: ' + res.data.data.invite_code);
      fetchClassrooms();
    } catch (err) {
      alert('Lỗi đổi mã lớp: ' + (err.response?.data?.message || err.message));
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Đã sao chép mã: ' + code);
  };

  const filteredClassrooms = classrooms.filter(c =>
    c.name?.toLowerCase().includes(searchName.toLowerCase())
  );

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">🏫 Quản lý lớp học</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="🔍 Tìm lớp..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-64"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Tạo lớp
          </button>
        </div>
      </div>

      {/* Danh sách lớp */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClassrooms.map(c => (
          <div key={c.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              {editingId === c.id ? (
                <>
                  <input
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    className="w-full border rounded px-2 py-1 mb-1"
                  />
                  <textarea
                    value={editData.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                    rows={2}
                    className="w-full border rounded px-2 py-1 resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleUpdate(c.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                  {c.description && <p className="text-sm text-gray-500 mt-1">{c.description}</p>}
                </>
              )}
            </div>

            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">👨‍🏫 Giảng viên:</span>
                <span>{c.teacher?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">👨‍🎓 Sinh viên:</span>
                <span>{c.students?.length || 0} SV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">📝 Bài thi:</span>
                <span>{c.exams?.length || 0} bài</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">🔑 Mã mời:</span>
                <div className="flex gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{c.invite_code || '—'}</code>
                  {c.invite_code && (
                    <>
                      <button
                        onClick={() => copyInviteCode(c.invite_code)}
                        className="text-blue-500 text-xs"
                      >
                        Sao chép
                      </button>
                      <button
  onClick={() => handleChangeInviteCode(c.id)}
  className="bg-green-100 border border-green-500 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition text-sm"
>
  Đổi mã
</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {editingId !== c.id && (
              <div className="bg-gray-50 px-4 py-3 flex justify-end gap-3">
                <button
                  onClick={() => handleEdit(c)}
                  className="bg-blue-100 border border-blue-500 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition text-sm"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="bg-red-100 border border-red-500 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition text-sm"
                >
                  Giải tán
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredClassrooms.length === 0 && (
        <div className="bg-white rounded shadow p-12 text-center text-gray-500">
          {searchName ? 'Không tìm thấy lớp' : 'Chưa có lớp học nào'}
        </div>
      )}

      {/* Modal tạo lớp */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">➕ Tạo lớp mới</h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Tên lớp *"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              <textarea
                placeholder="Mô tả (không bắt buộc)"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 mb-4 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo lớp'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;