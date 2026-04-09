// src/pages/teacher/StudentResult.jsx
import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import * as XLSX from 'xlsx';

const StudentResult = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examInfo, setExamInfo] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axiosClient.get('/exams');
      setExams(res.data?.data || []);
    } catch (error) {
      console.error('Lỗi:', error);
    }
  };

  const fetchResults = async () => {
    if (!selectedExam) return;

    setLoading(true);
    try {
      const examRes = await axiosClient.get(`/exams/${selectedExam}`);
      setExamInfo(examRes.data?.data);

      const res = await axiosClient.get(`/results/exam/${selectedExam}`);
      let attempts = res.data?.data || [];

      const uniqueResults = attempts.map(attempt => ({
        ...attempt,
        student_name: attempt.student?.name || 'N/A',
        student_code: attempt.student?.student_code || '—',
        attempt_count: 1,
      }));

      setResults(uniqueResults.sort((a, b) => (b.score || 0) - (a.score || 0)));
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Không thể tải kết quả');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExam) fetchResults();
  }, [selectedExam]);

  const getScoreClass = (score) => {
    if (score >= 8) return 'text-emerald-600 font-semibold';
    if (score >= 5) return 'text-blue-600';
    return 'text-rose-500';
  };

  const exportToExcel = () => {
    if (results.length === 0) return;
    setExporting(true);

    const data = [
      ['KẾT QUẢ BÀI THI'],
      ['Tên bài thi', examInfo?.title || 'N/A'],
      ['Môn học', examInfo?.subject?.name || 'N/A'],
      ['Ngày xuất', new Date().toLocaleString('vi-VN')],
      [],
      ['STT', 'Họ tên', 'Mã sinh viên', 'Điểm', 'Số lần thi']
    ];

    results.forEach((item, idx) => {
      data.push([idx + 1, item.student_name, item.student_code, item.score || 0, `${item.attempt_count}`]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kết quả');
    ws['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 16 }, { wch: 8 }, { wch: 10 }];
    XLSX.writeFile(wb, `Ket_qua_${examInfo?.title || 'bai_thi'}.xlsx`);
    setExporting(false);
  };

  const totalStudents = results.length;
  const avgScore = totalStudents > 0
    ? (results.reduce((sum, a) => sum + (a.score || 0), 0) / totalStudents).toFixed(1)
    : 0;
  const passedCount = results.filter(a => (a.score || 0) >= 5).length;
  const passRate = totalStudents > 0 ? ((passedCount / totalStudents) * 100).toFixed(0) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Kết quả sinh viên</h1>
          <p className="text-sm text-gray-500 mt-1">Xem điểm và xuất danh sách bài thi</p>
        </div>
        {results.length > 0 && (
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        )}
      </div>

      {/* Filter - Chọn bài thi */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">Chọn bài thi</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">-- Chọn bài thi --</option>
              {exams.map(exam => (
                <option key={exam._id} value={exam._id}>
                  {exam.title} — {exam.subject?.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kết quả */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : selectedExam ? (
        <>
          {results.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-12 text-center shadow-sm">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400">Chưa có sinh viên làm bài thi này</p>
            </div>
          ) : (
            <>


              {/* Bảng điểm */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học sinh</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sinh viên</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lần thi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {results.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-5 py-3 text-sm text-gray-400">{idx + 1}</td>
                          <td className="px-5 py-3">
                            <span className="font-medium text-gray-800">{item.student_name}</span>
                          </td>
                          <td className="px-5 py-3 font-mono text-sm text-gray-500">{item.student_code}</td>
                          <td className="px-5 py-3">
                            <span className={`text-lg font-semibold ${getScoreClass(item.score)}`}>{item.score}</span>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-500">{item.attempt_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 px-5 py-3 text-sm text-gray-500 border-t">
                  Tổng số: {results.length} sinh viên
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 py-12 text-center shadow-sm">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400">Vui lòng chọn bài thi để xem kết quả</p>
        </div>
      )}
    </div>
  );
};

export default StudentResult;