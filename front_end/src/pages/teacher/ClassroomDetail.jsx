// src/pages/teacher/ClassroomDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const ClassroomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignedExams, setAssignedExams] = useState([]);
  const [allExams, setAllExams] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1) Lấy thông tin lớp
      const classRes = await axiosClient.get(`/classrooms/${id}`);
      setClassroom(classRes.data?.data);

      // 2) Lấy danh sách học sinh
      const studentsRes = await axiosClient.get(
        `/class-students?classroom_id=${id}`
      );
      setStudents(studentsRes.data?.data || []);

      // 3) Lấy bài thi đã giao
      const assignedRes = await axiosClient.get(`/classrooms/${id}/exams`);
      const assigned = assignedRes.data?.data || [];
      setAssignedExams(assigned);

      // 4) Lấy tất cả bài thi
      const examsRes = await axiosClient.get("/exams");
      const all = examsRes.data?.data || [];
      setAllExams(all);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi tải dữ liệu lớp");
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER AVAILABLE EXAMS =================
  const availableExams = useMemo(() => {
    const assignedIds = assignedExams.map((e) => e.id);
    return allExams.filter((e) => !assignedIds.includes(e.id));
  }, [allExams, assignedExams]);

  // ================= SUBJECT LIST =================
  const subjects = useMemo(() => {
    const map = new Map();

    availableExams.forEach((exam) => {
      if (exam.subject?.id) {
        map.set(exam.subject.id, exam.subject);
      }
    });

    return Array.from(map.values());
  }, [availableExams]);

  // ================= EXAMS BY SUBJECT =================
  const examsBySubject = useMemo(() => {
    if (!selectedSubjectId) return [];
    return availableExams.filter(
      (e) => String(e.subject?.id) === String(selectedSubjectId)
    );
  }, [availableExams, selectedSubjectId]);

  // ================= ASSIGN EXAM =================
  const handleAssignExam = async () => {
    if (!selectedSubjectId) return alert("Vui lòng chọn môn học");
    if (!selectedExamId) return alert("Vui lòng chọn bài thi");

    try {
      await axiosClient.post(`/classrooms/${id}/assign-exam`, {
        exam_id: selectedExamId,
      });

      alert("Giao bài thi thành công");
      setShowAssignModal(false);
      setSelectedSubjectId("");
      setSelectedExamId("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi giao bài thi");
    }
  };

  // ================= REMOVE EXAM =================
  const handleRemoveExam = async (examId) => {
    if (!window.confirm("Xóa bài thi khỏi lớp?")) return;

    try {
      await axiosClient.delete(`/classrooms/${id}/exams/${examId}`);
      alert("Xóa bài thi thành công");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi xóa bài thi");
    }
  };

  // ================= REMOVE STUDENT =================
  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Xóa học sinh "${studentName}" khỏi lớp?`)) return;

    try {
      await axiosClient.delete(`/class-students/${studentId}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi xóa học sinh");
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div>
      {/* BACK */}
      <button
        onClick={() => navigate("/teacher/classes")}
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← Quay lại
      </button>

      {/* CLASS INFO */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h1 className="text-2xl font-bold">{classroom?.name}</h1>

        {classroom?.description && (
          <p className="text-gray-500 mt-1">{classroom.description}</p>
        )}

        <div className="flex gap-4 mt-2">
          <p className="text-sm text-gray-400">
            Số học sinh: {students.length}
          </p>
          <p className="text-sm text-gray-400">
            Mã lớp: {classroom?.invite_code}
          </p>
        </div>
      </div>

      {/* ASSIGNED EXAMS */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bài thi đã giao</h2>

          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Giao bài thi
          </button>
        </div>

        {assignedExams.length === 0 ? (
          <div className="bg-white rounded shadow p-8 text-center text-gray-500">
            Chưa có bài thi nào được giao
          </div>
        ) : (
          <div className="space-y-2">
            {assignedExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded shadow p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{exam.title}</h3>
                  <p className="text-sm text-gray-500">{exam.subject?.name}</p>
                  <p className="text-xs text-gray-400">
                    Thời gian: {exam.duration} phút
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveExam(exam.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STUDENTS LIST */}
      <div>
        <h2 className="text-xl font-bold mb-4">Học sinh trong lớp</h2>

        {students.length === 0 ? (
          <div className="bg-white rounded shadow p-8 text-center text-gray-500">
            Chưa có học sinh
          </div>
        ) : (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    STT
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Họ tên
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Mã sinh viên
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Ngày tham gia
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.map((s, index) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">
                          {s.student?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="ml-2 font-medium">
                          {s.student?.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-700">
                        {s.student?.student_code || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-500">
                      {s.student?.email}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(s.created_at).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleRemoveStudent(s.id, s.student?.name)
                        }
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL ASSIGN EXAM */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Giao bài thi cho lớp</h2>

            {/* SELECT SUBJECT */}
            <label className="text-sm font-semibold text-gray-600">
              Chọn môn học
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedExamId(""); // reset exam khi đổi môn
              }}
              className="w-full p-2 border rounded mb-4 mt-1"
            >
              <option value="">-- Chọn môn --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* SELECT EXAM */}
            <label className="text-sm font-semibold text-gray-600">
              Chọn bài thi
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full p-2 border rounded mb-4 mt-1"
              disabled={!selectedSubjectId}
            >
              <option value="">
                {selectedSubjectId
                  ? "-- Chọn bài thi --"
                  : "Vui lòng chọn môn trước"}
              </option>

              {examsBySubject.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({exam.duration} phút)
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleAssignExam}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Giao
              </button>

              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSubjectId("");
                  setSelectedExamId("");
                }}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomDetail;