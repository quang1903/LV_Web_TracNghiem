// src/pages/teacher/SubjectManager.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function SubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState({ id: null, name: "", description: "" });
  const [searchText, setSearchText] = useState("");
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Hiển thị toast
  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  // Fetch môn học
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/subjects");
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
      setSubjects([]);
      showToast("Lỗi khi tải môn học", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openModal = (subject = { _id: null, name: "", description: "" }) => {
    setCurrentSubject(subject);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentSubject({ id: null, name: "", description: "" });
  };

  // Thêm/Sửa môn học
  const saveSubject = async () => {
    if (!currentSubject.name.trim()) return showToast("Tên môn học không được để trống", "error");

    try {
      if (currentSubject._id) {
        await axiosClient.put(`/subjects/${currentSubject._id}`, currentSubject);
        showToast("Cập nhật môn học thành công!", "success");
      } else {
        await axiosClient.post("/subjects", currentSubject);
        showToast("Thêm môn học thành công!", "success");
      }
      fetchSubjects();
      closeModal();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Lỗi khi lưu môn học", "error");
    }
  };

  // Xóa môn học
  const deleteSubject = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa môn học này?")) return;
    try {
      await axiosClient.delete(`/subjects/${id}`);
      showToast("Xóa môn học thành công!", "success");
      fetchSubjects();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Lỗi khi xóa môn học", "error");
    }
  };

  // Filter + Phân trang
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* Toast đơn giản */}
      {toast.visible && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded shadow transition-opacity duration-500 ${toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
            }`}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Môn học</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        <input
          type="text"
          className="w-full md:w-1/3 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
          placeholder="Tìm kiếm môn học..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thêm Môn học
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded bg-white">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border text-left">ID</th>
                <th className="px-4 py-2 border text-left">Tên Môn</th>
                <th className="px-4 py-2 border text-left">Mô Tả</th>
                <th className="px-4 py-2 border text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubjects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Không tìm thấy môn học
                  </td>
                </tr>
              ) : (
                paginatedSubjects.map((subj) => (
                  <tr key={subj._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{subj._id}</td>
                    <td className="px-4 py-2 border">{subj.name}</td>
                    <td className="px-4 py-2 border">{subj.description || "-"}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => openModal(subj)}
                        className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteSubject(subj._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${page === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {currentSubject._id ? "Sửa Môn học" : "Thêm Môn học"}
            </h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring focus:border-blue-400"
              placeholder="Tên môn học"
              value={currentSubject.name}
              onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
            />
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:border-blue-400"
              placeholder="Mô tả môn học"
              value={currentSubject.description}
              onChange={(e) =>
                setCurrentSubject({ ...currentSubject, description: e.target.value })
              }
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={saveSubject}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}