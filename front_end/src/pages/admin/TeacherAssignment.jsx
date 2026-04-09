// src/pages/admin/TeacherAssignment.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const TeacherAssignment = ({ subjectId }) => {
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const [assignedRes, availableRes] = await Promise.all([
        axiosClient.get(`/subjects/${subjectId}/teachers`),
        axiosClient.get(`/subjects/${subjectId}/available-teachers`),
      ]);
      setAssignedTeachers(assignedRes.data.data);
      setAvailableTeachers(availableRes.data.data);
    } catch (error) {
      console.error("Error fetching teachers:", error.response?.data || error);
      setMessage("Không thể tải danh sách giáo viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [subjectId]);

  const toggleTeacher = (teacherId) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleAssign = async () => {
    if (selectedTeachers.length === 0) {
      setMessage("Vui lòng chọn ít nhất 1 giáo viên để phân công");
      return;
    }
    try {
      setLoading(true);
      const res = await axiosClient.post(`/subjects/${subjectId}/teachers`, {
        teacher_ids: selectedTeachers,
      });
      setMessage(res.data.message);
      setSelectedTeachers([]);
      fetchTeachers();
    } catch (error) {
      console.error("Assign error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Lỗi khi phân công giáo viên");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (teacherId) => {
    try {
      setLoading(true);
      const res = await axiosClient.delete(`/subjects/${subjectId}/teachers/${teacherId}`);
      setMessage(res.data.message);
      fetchTeachers();
    } catch (error) {
      console.error("Unassign error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Lỗi khi bỏ phân công giáo viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-4">Phân công giáo viên</h2>
      {message && <p className="text-green-600 font-semibold mb-2">{message}</p>}
      {loading && <p>Đang tải...</p>}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Giáo viên chưa phân công */}
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Chưa phân công</h3>
          {availableTeachers.length === 0 ? (
            <p>Không còn giáo viên nào</p>
          ) : (
            availableTeachers.map((teacher) => (
              <label
                key={teacher.id}
                className="flex items-center gap-2 mb-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTeachers.includes(teacher.id)}
                  onChange={() => toggleTeacher(teacher.id)}
                  className="accent-blue-500"
                />
                {teacher.name} ({teacher.email})
              </label>
            ))
          )}
          <button
            onClick={handleAssign}
            disabled={loading || selectedTeachers.length === 0}
            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
          >
            Phân công
          </button>
        </div>

        {/* Giáo viên đã phân công */}
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Đã phân công</h3>
          {assignedTeachers.length === 0 ? (
            <p>Chưa có giáo viên nào</p>
          ) : (
            <div className="flex flex-col gap-1">
              {assignedTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex justify-between items-center p-2 border-b border-gray-200"
                >
                  <span>
                    {teacher.name} ({teacher.email})
                  </span>
                  <button
                    onClick={() => handleUnassign(teacher.id)}
                    disabled={loading}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  >
                    Bỏ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignment;