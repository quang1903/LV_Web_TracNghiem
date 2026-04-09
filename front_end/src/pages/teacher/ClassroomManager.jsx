// src/pages/teacher/ClassroomManager.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function ClassroomManager() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const [editing, setEditing] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const [inviteInfo, setInviteInfo] = useState(null);

  const [form, setForm] = useState({ name: "", description: "" });

  // ================= FETCH =================
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/classrooms");
      setClasses(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Không thể tải danh sách lớp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ================= MODAL CREATE/EDIT =================
  const openModal = (cls = null) => {
    setEditing(cls);
    setForm({
      name: cls?.name || "",
      description: cls?.description || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm({ name: "", description: "" });
  };

  const submitClass = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axiosClient.put(`/classrooms/${editing._id}`, form);
        alert("Cập nhật thành công");
      } else {
        await axiosClient.post("/classrooms", form);
        alert("Tạo lớp thành công");
      }
      closeModal();
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi khi lưu lớp");
    }
  };

  // ================= DELETE =================
  const deleteClass = async (cls) => {
    if (!window.confirm(`Xóa lớp "${cls.name}"?`)) return;

    try {
      await axiosClient.delete(`/classrooms/${cls._id}`);
      alert("Xóa thành công");
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi khi xóa lớp");
    }
  };

  // ================= INVITE CODE =================
  const openInvite = async (cls) => {
    try {
      setSelectedClass(cls);
      const res = await axiosClient.get(`/classrooms/${cls._id}/invite-code`);
      setInviteInfo(res.data?.data || null);
      setInviteOpen(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi lấy mã mời");
    }
  };

  const regenerateInvite = async () => {
    try {
      const res = await axiosClient.post(
        `/classrooms/${selectedClass._id}/regenerate-code`
      );
      setInviteInfo(res.data?.data || null);
      alert("Tạo mã mới thành công");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi tạo mã mới");
    }
  };

  const copyCode = async () => {
    if (!inviteInfo?.invite_code) return;
    await navigator.clipboard.writeText(inviteInfo.invite_code);
    alert("Đã sao chép mã!");
  };

  // ================= UI =================
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp học</h1>

          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            + Tạo lớp
          </button>
        </div>

        {/* LIST */}
        {classes.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            Chưa có lớp học nào
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className="bg-white border rounded-xl shadow-sm p-4"
              >
                <h2 className="font-bold text-lg text-gray-900">{cls.name}</h2>

                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {cls.description || "(Chưa có mô tả)"}
                </p>

                <div className="text-xs text-gray-400 mt-3 flex justify-between">
                  <span>👥 {cls.students?.length || 0} học sinh</span>
                  <span>📝 {cls.exams?.length || 0} bài thi</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">


<button
  onClick={() => navigate(`/teacher/classes/${cls._id}`)}
  className="bg-gray-100 border border-gray-400 text-gray-800 px-3 py-1 rounded hover:bg-gray-200 transition text-sm"
>
  Chi tiết
</button>

<button
  onClick={() => openInvite(cls)}
  className="bg-green-100 border border-green-500 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition text-sm"
>
  Mã mời
</button>

<button
  onClick={() => openModal(cls)}
  className="bg-yellow-100 border border-yellow-500 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition text-sm"
>
  Sửa
</button>

<button
  onClick={() => deleteClass(cls)}
  className="bg-red-100 border border-red-500 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition text-sm"
>
  Xóa
</button>

                  
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= MODAL CREATE/EDIT ================= */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div className="bg-white w-full max-w-md rounded-xl p-5">
              <h2 className="text-lg font-bold mb-4">
                {editing ? "Sửa lớp học" : "Tạo lớp mới"}
              </h2>

              <form onSubmit={submitClass}>
                <input
                  type="text"
                  placeholder="Tên lớp"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  required
                />

                <textarea
                  placeholder="Mô tả"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 mb-4"
                  rows={3}
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Lưu
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL INVITE ================= */}
        {inviteOpen && selectedClass && inviteInfo && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div className="bg-white w-full max-w-md rounded-xl p-5">
              <h2 className="text-lg font-bold">Mã mời lớp</h2>
              <p className="text-sm text-gray-500 mb-4">{selectedClass.name}</p>

              <div className="bg-gray-100 border border-dashed rounded-xl p-4 text-center">
                <p className="text-3xl font-mono font-bold text-blue-700 tracking-widest">
                  {inviteInfo.invite_code}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={copyCode}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Sao chép
                </button>

                <button
                  onClick={regenerateInvite}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600"
                >
                  Tạo mới
                </button>
              </div>

              <button
                onClick={() => setInviteOpen(false)}
                className="w-full mt-3 bg-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}