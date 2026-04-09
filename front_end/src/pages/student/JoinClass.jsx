// src/pages/student/JoinClass.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const JoinClass = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classInfo, setClassInfo] = useState(null);

  const handleCheckCode = async () => {
    if (!inviteCode.trim()) {
      setError('Vui lòng nhập mã mời');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axiosClient.get(`/check-code/${inviteCode.toUpperCase()}`);
      setClassInfo(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã không hợp lệ');
      setClassInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/join-class', {
        invite_code: inviteCode.toUpperCase()
      });
      alert(res.data.message);
      navigate('/student/classes');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tham gia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-center mb-6">Tham gia lớp học</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Nhập mã mời</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="VD: ABC12345"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="flex-1 p-2 border rounded uppercase"
            maxLength={8}
          />
          <button
            onClick={handleCheckCode}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Kiểm tra
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {classInfo && (
        <div className="mb-4 p-4 bg-green-50 rounded">
          <p className="font-medium">Lớp: {classInfo.class_name}</p>
          <p className="text-sm text-gray-600">Giảng viên: {classInfo.teacher_name}</p>
          <p className="text-sm text-gray-500">Số học sinh: {classInfo.student_count}</p>
          <button
            onClick={handleJoin}
            disabled={loading}
            className="mt-3 w-full bg-green-600 text-white py-2 rounded"
          >
            {loading ? 'Đang xử lý...' : 'Tham gia lớp'}
          </button>
        </div>
      )}
      
      <button
        onClick={() => navigate('/student/classes')}
        className="w-full mt-2 text-gray-500 text-sm"
      >
        ← Quay lại
      </button>
    </div>
  );
};

export default JoinClass;