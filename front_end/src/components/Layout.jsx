// src/components/Layout.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const studentNav = [
  { to: "/", label: "Tổng quan", icon: "🏠" },
  { to: "/exams", label: "Đề thi", icon: "📝" },
  { to: "/subjects", label: "Môn học", icon: "📚" },
  { to: "/attempts", label: "Lịch sử thi", icon: "📊" },
];

const teacherNav = [
  { to: "/", label: "Tổng quan", icon: "🏠" },
  { to: "/exams", label: "Đề thi", icon: "📝" },
  { to: "/subjects", label: "Môn học", icon: "📚" },
  { to: "/classes", label: "Lớp học", icon: "🏫" },
  { to: "/questions", label: "Câu hỏi", icon: "❓" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const navItems = isTeacher ? teacherNav : studentNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-white border-r border-slate-100 shadow-sm transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            TN
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-800 text-sm leading-tight">
              Trắc Nghiệm <br />
              <span className="text-sky-500 font-normal text-xs">Online</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-sky-50 text-sky-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-slate-100">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.role || "student"}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="text-base">🚪</span>
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full w-5 h-10 bg-white border border-slate-200 rounded-r-lg flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm z-10"
          style={{ marginLeft: collapsed ? "3.5rem" : "14.5rem", transition: "margin 0.3s" }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Xin chào, {user?.name} 👋
            </h1>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold capitalize">
              {user?.role || "student"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}