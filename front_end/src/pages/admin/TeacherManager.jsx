// src/pages/admin/TeacherManager.jsx
import React, { useEffect, useState } from "react";
import axios from "../../api/axiosClient"; // Đảm bảo path đúng với axiosClient của bạn

const TeacherManager = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subjectsMap, setSubjectsMap] = useState({}); // Lưu môn học của từng teacher

  // Lấy danh sách giáo viên
  const fetchTeachers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/teachers"); // /api/teachers
      setTeachers(res.data.data);
    } catch (err) {
      console.error("Lỗi khi lấy giáo viên:", err);
      setError("Không thể lấy danh sách giáo viên");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách môn học của 1 giáo viên
  const fetchSubjects = async (teacherId) => {
    if (subjectsMap[teacherId]) return; // Nếu đã fetch rồi thì bỏ qua
    try {
      const res = await axios.get(`/teachers/${teacherId}/subjects`);
      setSubjectsMap((prev) => ({ ...prev, [teacherId]: res.data.data }));
    } catch (err) {
      console.error("Lỗi khi lấy môn học:", err);
      setSubjectsMap((prev) => ({ ...prev, [teacherId]: [] }));
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading) return <div>Đang tải danh sách giáo viên...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Giáo viên</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Tên</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Số môn học</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <React.Fragment key={teacher.id}>
              <tr>
                <td className="border px-4 py-2">{teacher.id}</td>
                <td className="border px-4 py-2">{teacher.name}</td>
                <td className="border px-4 py-2">{teacher.email}</td>
                <td className="border px-4 py-2">{teacher.subjects_count}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => fetchSubjects(teacher.id)}
                  >
                    Xem môn học
                  </button>
                </td>
              </tr>
              {subjectsMap[teacher.id] && subjectsMap[teacher.id].length > 0 && (
                <tr>
                  <td colSpan="5" className="bg-gray-50 px-4 py-2">
                    <strong>Môn học:</strong>{" "}
                    {subjectsMap[teacher.id].map((s) => s.name).join(", ")}
                  </td>
                </tr>
              )}
              {subjectsMap[teacher.id] && subjectsMap[teacher.id].length === 0 && (
                <tr>
                  <td colSpan="5" className="bg-gray-50 px-4 py-2 text-gray-500">
                    Giáo viên chưa có môn học
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherManager;