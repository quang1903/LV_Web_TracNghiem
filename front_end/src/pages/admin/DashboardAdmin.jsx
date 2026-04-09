// src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_students: 0, total_teachers: 0, total_exams: 0, total_attempts: 0, total_subjects: 0, total_classes: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [recentClasses, setRecentClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => { if (!hasFetched.current) { hasFetched.current = true; fetchData(); } }, []);

  const getData = (res) => res.data?.data || res.data || [];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [users, students, teachers, exams, subjects, classes] = await Promise.all([
        axiosClient.get('/users'), axiosClient.get('/students'), axiosClient.get('/teachers'),
        axiosClient.get('/exams'), axiosClient.get('/subjects'), axiosClient.get('/classrooms')
      ]);
      
      const usersData = getData(users), studentsData = getData(students), teachersData = getData(teachers);
      const examsData = getData(exams), subjectsData = getData(subjects), classesData = getData(classes);
      const totalAttempts = examsData.reduce((sum, e) => sum + (e.attempt_count || 0), 0);
      
      setStats({ total_users: usersData.length, total_students: studentsData.length, total_teachers: teachersData.length, total_exams: examsData.length, total_attempts: totalAttempts, total_subjects: subjectsData.length, total_classes: classesData.length });
      setRecentUsers([...usersData].sort((a,b) => b.id - a.id).slice(0,5));
      setRecentExams([...examsData].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5));
      setRecentClasses([...classesData].sort((a,b) => b.id - a.id).slice(0,5));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const menu = [
    { path: '/admin/users', icon: '👥', label: 'Quản lý người dùng', color: 'blue' },
    { path: '/admin/subjects', icon: '📚', label: 'Quản lý môn học', color: 'green' },
    { path: '/admin/exams', icon: '📝', label: 'Quản lý bài thi', color: 'purple' },
    { path: '/admin/classes', icon: '🏫', label: 'Quản lý lớp học', color: 'orange' }
  ];

  const roleBadge = (role) => {
    const config = { admin: 'bg-red-100 text-red-700', teacher: 'bg-blue-100 text-blue-700', student: 'bg-green-100 text-green-700' };
    const text = { admin: 'Quản trị', teacher: 'Giảng viên', student: 'Học sinh' };
    return <span className={`px-2 py-1 text-xs rounded-full ${config[role]}`}>{text[role]}</span>;
  };

  const examBadge = (status) => {
    const config = { published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-700', closed: 'bg-red-100 text-red-700' };
    const text = { published: 'Đã xuất bản', draft: 'Bản nháp', closed: 'Đã đóng' };
    return <span className={`px-2 py-1 text-xs rounded-full ${config[status]}`}>{text[status]}</span>;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div><span className="ml-2">Đang tải...</span></div>;

  return (
    <div className="px-4 pb-8">
      <h1 className="text-2xl font-bold mb-6">📊 Tổng quan hệ thống</h1>
      
      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Tổng người dùng', value: stats.total_users, icon: '👥', color: 'blue', sub: `👨‍🎓 ${stats.total_students} học sinh • 👨‍🏫 ${stats.total_teachers} giảng viên` },
          { title: 'Môn học', value: stats.total_subjects, icon: '📚', color: 'green', sub: 'Tổng số môn học' },
          { title: 'Bài thi', value: stats.total_exams, icon: '📝', color: 'purple', sub: `${stats.total_attempts} lượt làm bài` },
          { title: 'Lớp học', value: stats.total_classes, icon: '🏫', color: 'orange', sub: 'Lớp đang hoạt động' }
        ].map((c, i) => (
          <div key={i} className={`bg-gradient-to-br from-${c.color}-500 to-${c.color}-600 text-white p-4 rounded-xl shadow-lg`}>
            <div className="flex justify-between"><div><p className="text-xs opacity-90">{c.title}</p><p className="text-2xl font-bold">{c.value}</p></div><div className="text-2xl opacity-80">{c.icon}</div></div>
            <div className="text-xs opacity-80 mt-2">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Hành động nhanh */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">⚡ Hành động nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {menu.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`bg-${item.color}-50 p-4 rounded-xl hover:shadow-md transition border border-${item.color}-100`}>
              <div className="flex items-center gap-3"><div className="text-3xl">{item.icon}</div><div className="font-semibold text-gray-800">{item.label}</div></div>
            </button>
          ))}
        </div>
      </div>

      {/* 3 cột dữ liệu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Người dùng mới */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b bg-gray-50"><h2 className="font-semibold">👥 Người dùng mới</h2></div>
          <div className="divide-y max-h-[400px] overflow-auto">
            {!recentUsers.length ? <div className="p-8 text-center text-gray-400">Chưa có người dùng</div> : recentUsers.map(user => (
              <div key={user.id} className="px-4 py-3 hover:bg-gray-50 flex justify-between items-center">
                <div><p className="font-medium">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div>
                {roleBadge(user.role)}
              </div>
            ))}
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t"><button onClick={() => navigate('/admin/users')} className="text-blue-600 text-sm">Xem tất cả →</button></div>
        </div>

        {/* Bài thi gần đây */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b bg-gray-50"><h2 className="font-semibold">📝 Bài thi gần đây</h2></div>
          <div className="divide-y max-h-[400px] overflow-auto">
            {!recentExams.length ? <div className="p-8 text-center text-gray-400">Chưa có bài thi</div> : recentExams.map(exam => (
              <div key={exam.id} className="px-4 py-3">
                <div className="flex justify-between"><p className="font-medium">{exam.title}</p>{examBadge(exam.status)}</div>
                <p className="text-xs text-gray-500 mt-1">{exam.subject?.name || 'Chưa phân môn'}</p>
                <div className="text-xs text-gray-400 mt-1">⏰ {exam.duration || 0} phút • 📊 {exam.total_questions || 0} câu</div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t"><button onClick={() => navigate('/admin/exams')} className="text-blue-600 text-sm">Xem tất cả →</button></div>
        </div>

        {/* Lớp học gần đây */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b bg-gray-50"><h2 className="font-semibold">🏫 Lớp học gần đây</h2></div>
          <div className="divide-y max-h-[400px] overflow-auto">
            {!recentClasses.length ? <div className="p-8 text-center text-gray-400">Chưa có lớp học</div> : recentClasses.map(cls => (
              <div key={cls.id} className="px-4 py-3">
                <p className="font-medium">{cls.name}</p>
                <p className="text-xs text-gray-500">👨‍🏫 {cls.teacher?.name || 'Chưa có GV'}</p>
                {cls.description && <p className="text-xs text-gray-400 truncate">{cls.description}</p>}
              </div>
            ))}
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t"><button onClick={() => navigate('/admin/classes')} className="text-blue-600 text-sm">Xem tất cả →</button></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;