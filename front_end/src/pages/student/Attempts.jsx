// src/pages/student/Attempts.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const Attempts = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const res = await axiosClient.get('/attempts');
      setAttempts(res.data?.data || res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        📊 Lịch sử làm bài
      </h1>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-500 text-sm sm:text-base">Chưa có bài làm nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Bài thi
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Môn học
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Điểm
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Ngày làm
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                    {attempt.exam?.title}
                  </td>
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                    {attempt.exam?.subject?.name}
                  </td>
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <span
                      className={`font-bold ${
                        attempt.score >= 5 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {attempt.score}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-gray-500 whitespace-nowrap">
                    {attempt.submitted_at
                      ? new Date(attempt.submitted_at).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/student/result/${attempt.id}`)}
                      className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                      Xem kết quả
                    </button>
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

export default Attempts;