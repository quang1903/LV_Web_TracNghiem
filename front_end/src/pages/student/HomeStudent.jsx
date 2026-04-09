// src/pages/student/HomeStudent.jsx
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HomeStudent = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { path: "/student", label: "🏠 Trang chủ" },
    { path: "/student/subjects", label: "📚 Môn học" },
    { path: "/student/exams", label: "📝 Bài thi" },
    { path: "/student/attempts", label: "📊 Lịch sử làm bài" },
    { path: "/student/classes", label: "👥 Lớp học" },
    { path: "/student/join", label: "🔑 Tham gia lớp" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Overlay mobile */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 h-full z-40 w-64 bg-gradient-to-b from-blue-600 to-blue-800 shadow-lg flex flex-col",
          "transition-transform duration-200 ease-in-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
          "sm:relative sm:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-500 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">QuizPro</h2>
            <p className="text-sm text-blue-200 mt-1">Học sinh</p>
          </div>

          {/* Close button mobile */}
          <button
            onClick={() => setDrawerOpen(false)}
            className="sm:hidden p-1 rounded text-blue-100 hover:text-white hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/student"}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-white text-blue-600 font-medium"
                    : "text-white hover:bg-blue-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-blue-500 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "S"}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {user?.name || "Học sinh"}
              </p>
              <p className="text-blue-200 text-xs truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <header className="sm:hidden sticky top-0 z-20 bg-white shadow-sm flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Mở menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-blue-600">QuizPro</span>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HomeStudent;