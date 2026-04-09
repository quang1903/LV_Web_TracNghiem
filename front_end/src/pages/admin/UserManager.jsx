// src/pages/admin/UserManager.jsx
import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [searchName, setSearchName] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    student_code: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/users');
      setUsers(response.data?.data || response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    if (filterRole && u.role !== filterRole) return false;
    if (searchName && !u.name?.toLowerCase().includes(searchName.toLowerCase())) return false;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, searchName]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      student_code: ''
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      student_code: user.student_code || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const submitData = { ...formData };
      if (!submitData.password) {
        delete submitData.password;
      }
      
      if (editingUser) {
        await axiosClient.put(`/users/${editingUser.id}`, submitData);
        alert('Cập nhật người dùng thành công');
      } else {
        await axiosClient.post('/users', submitData);
        alert('Thêm người dùng thành công');
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name, role) => {
    let msg = `Xóa người dùng "${name}"?`;
    if (role === 'teacher') msg = `⚠️ Xóa giảng viên "${name}" sẽ mất bài thi và lớp học.\n\nBạn chắc chắn?`;
    if (role === 'student') msg = `⚠️ Xóa sinh viên "${name}" sẽ mất kết quả thi.\n\nBạn chắc chắn?`;
    if (!window.confirm(msg)) return;
    
    try {
      await axiosClient.delete(`/users/${id}`);
      alert('Xóa thành công!');
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 400) {
        const data = error.response.data;
        let message = `Không thể xóa "${name}"\n\n`;
        if (data.related_items?.exams) message += `📝 ${data.related_items.exams.count} bài thi\n`;
        if (data.related_items?.classrooms) message += `🏫 ${data.related_items.classrooms.count} lớp học\n`;
        if (data.related_items?.attempts) message += `👨‍🎓 ${data.related_items.attempts.count} bài làm\n`;
        
        if (data.requires_confirmation && window.confirm(message + '\nXóa tất cả?')) {
          await axiosClient.delete(`/users/${id}/force`);
          alert('Đã xóa người dùng và dữ liệu');
          fetchUsers();
        } else {
          alert(message);
        }
      } else {
        alert(error.response?.data?.message || 'Lỗi xóa');
      }
    }
  };

  const getRoleBadge = (role) => {
    const config = { 
      admin: 'bg-red-100 text-red-700', 
      teacher: 'bg-blue-100 text-blue-700', 
      student: 'bg-green-100 text-green-700' 
    };
    const texts = { admin: 'Quản trị viên', teacher: 'Giảng viên', student: 'Sinh viên' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[role]}`}>{texts[role]}</span>;
  };

  // Pagination component
  const Pagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 order-2 sm:order-1">
          <span>Hiển thị</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>kết quả</span>
        </div>
        
        <div className="flex items-center gap-1 flex-wrap justify-center order-1 sm:order-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ‹
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="hidden sm:inline-block px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                1
              </button>
              {startPage > 2 && <span className="hidden sm:inline-block px-2 text-gray-400">...</span>}
            </>
          )}
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 rounded-lg transition ${
                currentPage === number
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="hidden sm:inline-block px-2 text-gray-400">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="hidden sm:inline-block px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            »
          </button>
        </div>
        
        <div className="text-sm text-gray-500 order-3">
          {filteredUsers.length > 0 ? (
            <span className="hidden sm:inline">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} trên {filteredUsers.length}
            </span>
          ) : (
            <>0 kết quả</>
          )}
        </div>
      </div>
    );
  };

  // Mobile Card View Component
  const MobileUserCard = ({ user, isSelf }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-base">{user.name}</h3>
          <p className="text-sm text-gray-500 mt-1 break-all">{user.email}</p>
        </div>
        {getRoleBadge(user.role)}
      </div>
      
      {user.student_code && (
        <div className="mb-3 pb-2">
          <span className="text-xs text-gray-400">Mã sinh viên</span>
          <p className="text-sm text-gray-700 font-mono">{user.student_code}</p>
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => openEditModal(user)}
          className="flex-1 py-2 text-amber-600 hover:text-amber-700 text-sm font-medium bg-amber-50 rounded-lg transition"
        >
          ✏️ Sửa
        </button>
        <button
          onClick={() => handleDelete(user.id, user.name, user.role)}
          disabled={isSelf}
          className={`flex-1 py-2 text-red-500 hover:text-red-600 text-sm font-medium bg-red-50 rounded-lg transition ${
            isSelf ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">👥 Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản admin, giảng viên và sinh viên</p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm người dùng
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tìm theo tên</label>
            <input
              type="text"
              placeholder="Nhập tên người dùng..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Lọc theo vai trò</label>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả</option>
              <option value="admin">Quản trị viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="student">Sinh viên</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table - Desktop */}
      <div className="hidden lg:block">
        {currentUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-12 text-center shadow-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-400">{searchName || filterRole ? 'Không tìm thấy người dùng' : 'Không có người dùng'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SV</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentUsers.map(user => {
                    const isSelf = currentUserId === user.id;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-3">
                          <span className="font-medium text-gray-800">{user.name}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">{user.email}</td>
                        <td className="px-5 py-3 font-mono text-sm text-gray-500">{user.student_code || '—'}</td>
                        <td className="px-5 py-3">{getRoleBadge(user.role)}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.name, user.role)}
                              disabled={isSelf}
                              className={`text-red-500 hover:text-red-600 text-sm font-medium ${
                                isSelf ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Cards - Tablet & Mobile */}
      <div className="lg:hidden space-y-3">
        {currentUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-12 text-center shadow-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-400">{searchName || filterRole ? 'Không tìm thấy người dùng' : 'Không có người dùng'}</p>
          </div>
        ) : (
          currentUsers.map(user => {
            const isSelf = currentUserId === user.id;
            return <MobileUserCard key={user.id} user={user} isSelf={isSelf} />;
          })
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="mt-6">
          <Pagination />
        </div>
      )}

      {/* Modal Thêm/Sửa người dùng */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required={!editingUser}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="student">Sinh viên</option>
                  <option value="teacher">Giảng viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã sinh viên</label>
                <input
                  type="text"
                  value={formData.student_code}
                  onChange={(e) => setFormData({...formData, student_code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Chỉ dành cho sinh viên"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Đang xử lý...' : (editingUser ? 'Cập nhật' : 'Thêm mới')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
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

export default UserManager;