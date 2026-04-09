import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import TeacherAssignment from "./TeacherAssignment";

const SubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [showTeacherAssign, setShowTeacherAssign] = useState(null);

  // --- SEARCH & PAGINATION ---
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // số môn học / trang

  // -------------------- API CALLS --------------------
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/subjects");
      setSubjects(res.data.data);
    } catch (err) {
      console.error(err);
      setMessage("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const saveSubject = async (subjectData) => {
    setLoading(true);
    try {
      let res;
      if (editingSubject) {
        res = await axiosClient.put(`/subjects/${editingSubject.id}`, subjectData);
      } else {
        res = await axiosClient.post("/subjects", subjectData);
      }
      setMessage(res.data.message);
      setForm({ name: "", description: "" });
      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Lỗi khi lưu môn học");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa môn học này?")) return;
    setLoading(true);
    try {
      const res = await axiosClient.delete(`/subjects/${id}`);
      setMessage(res.data.message);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Lỗi khi xóa môn học");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- FORM HANDLING --------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage("Tên môn học không được để trống");
      return;
    }
    saveSubject(form);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setForm({ name: subject.name, description: subject.description || "" });
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setForm({ name: "", description: "" });
  };

  const toggleTeacherAssign = (subjectId) => {
    setShowTeacherAssign(showTeacherAssign === subjectId ? null : subjectId);
  };

  // -------------------- EFFECT --------------------
  useEffect(() => {
    fetchSubjects();
  }, []);

  // -------------------- FILTER & PAGINATION --------------------
  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.name.toLowerCase().includes(filter.toLowerCase()) ||
      (sub.description || "").toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const currentSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quản lý môn học</h1>

      {message && <p className="text-green-600 font-semibold mb-2">{message}</p>}
      {loading && <p className="mb-2">Đang tải...</p>}

      {/* SEARCH */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Tìm kiếm môn học..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1); // reset về trang 1 khi filter
          }}
          className="border rounded px-3 py-2 w-full md:flex-1"
        />
      </div>

      {/* FORM THÊM / SỬA */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 mb-6 items-center"
      >
        <input
          type="text"
          name="name"
          placeholder="Tên môn học"
          value={form.name}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2 w-full md:flex-1"
        />
        <input
          type="text"
          name="description"
          placeholder="Mô tả"
          value={form.description}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full md:flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingSubject ? "Cập nhật" : "Thêm môn học"}
        </button>
        {editingSubject && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Hủy
          </button>
        )}
      </form>

      {/* DANH SÁCH MÔN HỌC */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Tên</th>
              <th className="border px-4 py-2">Mô tả</th>
              <th className="border px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentSubjects.length === 0 && (
              <tr>
                <td colSpan={4} className="border px-4 py-2 text-center">
                  Không có môn học
                </td>
              </tr>
            )}
            {currentSubjects.map((subject) => (
              <tr key={subject.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{subject.id}</td>
                <td className="border px-4 py-2">{subject.name}</td>
                <td className="border px-4 py-2">{subject.description || "-"}</td>
                <td className="border px-4 py-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteSubject(subject.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => toggleTeacherAssign(subject.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                  >
                    Quản lý giáo viên
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-200"
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage ? "bg-blue-600 text-white" : ""
              } hover:bg-gray-200`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-200"
          >
            {">"}
          </button>
        </div>
      )}

      {/* TEACHER ASSIGNMENT */}
      {showTeacherAssign && (
        <div className="mt-6 border-t pt-4">
          <TeacherAssignment subjectId={showTeacherAssign} />
        </div>
      )}
    </div>
  );
};

export default SubjectManager;