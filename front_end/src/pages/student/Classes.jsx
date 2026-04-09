// src/pages/student/Classes.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const Classes = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axiosClient.get('/my-classes');
      setClasses(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const leaveClass = async (classId, className) => {
    if (!window.confirm(`Rời khỏi lớp "${className}"?`)) return;
    try {
      await axiosClient.delete(`/leave-class/${classId}`);
      fetchClasses();
      alert('Rời lớp thành công');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lớp học của tôi</h1>
        <button
          onClick={() => navigate('/student/join')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Tham gia lớp
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded shadow p-12 text-center">
          <p className="text-gray-500 mb-4">Bạn chưa tham gia lớp học nào</p>
          <button
            onClick={() => navigate('/student/join')}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Tham gia lớp bằng mã mời
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <div key={cls._id} className="bg-white rounded shadow p-4">
              <h3 className="font-semibold text-lg">{cls.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Giảng viên: {cls.teacher?.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Số học sinh: {cls.students_count || cls.students?.length || 0}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/student/classes/${cls._id}`)}
                  className="flex-1 bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={() => leaveClass(cls._id, cls.name)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Rời lớp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classes;