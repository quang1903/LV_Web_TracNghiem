// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Admin pages
import DashboardAdmin from './pages/admin/DashboardAdmin';
import UserManager from './pages/admin/UserManager';
import SubjectManagerAdmin from './pages/admin/SubjectManager';
import ExamManagerAdmin from './pages/admin/ExamManager';
import ClassManagerAdmin from './pages/admin/ClassManager';
import HomeAdmin from './pages/admin/HomeAdmin';
import TeacherManager from './pages/admin/TeacherManager'; // <-- import thêm

// Teacher pages
import HomeTeacher from './pages/teacher/HomeTeacher';
import DashboardHomeTeacher from './pages/teacher/DashboardHome';
import SubjectManagerTeacher from './pages/teacher/SubjectManager';
import ExamManagerTeacher from './pages/teacher/ExamManager';
import QuestionManager from './pages/teacher/QuestionManager';
import ClassroomManager from './pages/teacher/ClassroomManager';
import ClassroomDetail from './pages/teacher/ClassroomDetail';
import StudentResult from './pages/teacher/StudentResult';

// Student pages
import HomeStudent from './pages/student/HomeStudent';
import DashboardHomeStudent from './pages/student/DashboardHome';
import SubjectsStudent from './pages/student/Subjects';
import SubjectExams from './pages/student/SubjectExams';
import ExamsStudent from './pages/student/Exams';
import ExamDetail from './pages/student/ExamDetail';
import ExamResult from './pages/student/ExamResult';
import AttemptsStudent from './pages/student/Attempts';
import ClassesStudent from './pages/student/Classes';
import JoinClass from './pages/student/JoinClass';
import ClassDetail from './pages/student/ClassDetail';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const AppRoutes = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Chỉ hiển thị loading khi đang kiểm tra authentication lần đầu
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Admin Routes */}
      {isAuthenticated && user?.role === 'admin' && (
        <Route path="/admin" element={<HomeAdmin />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="users" element={<UserManager />} />

          <Route path="teachers" element={<TeacherManager />} /> {/* <-- route mới */}
          <Route path="subjects" element={<SubjectManagerAdmin />} />
          <Route path="exams" element={<ExamManagerAdmin />} />
          <Route path="classes" element={<ClassManagerAdmin />} />
        </Route>
      )}
      
      {/* Teacher Routes */}
      {isAuthenticated && user?.role === 'teacher' && (
        <Route path="/teacher" element={<HomeTeacher />}>
          <Route index element={<DashboardHomeTeacher />} />
          <Route path="subjects" element={<SubjectManagerTeacher />} />
          <Route path="exams" element={<ExamManagerTeacher />} />
          <Route path="questions" element={<QuestionManager />} />
          <Route path="classes" element={<ClassroomManager />} />
          <Route path="classes/:id" element={<ClassroomDetail />} />
          <Route path="results" element={<StudentResult />} />
        </Route>
      )}
      
      {/* Student Routes */}
      {isAuthenticated && user?.role === 'student' && (
        <Route path="/student" element={<HomeStudent />}>
          <Route index element={<DashboardHomeStudent />} />
          <Route path="subjects" element={<SubjectsStudent />} />
          <Route path="subjects/:id" element={<SubjectExams />} />
          <Route path="exams" element={<ExamsStudent />} />
          <Route path="exams/:id" element={<ExamDetail />} />
          
          <Route path="result/:attemptId" element={<ExamResult />} />
          <Route path="attempts" element={<AttemptsStudent />} />
          <Route path="classes" element={<ClassesStudent />} />
          <Route path="classes/:id" element={<ClassDetail />} />
          <Route path="join" element={<JoinClass />} />
        </Route>
      )}
      
      {/* Fallback route */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={
              isAuthenticated && user?.role === 'admin' ? '/admin' : 
              isAuthenticated && user?.role === 'teacher' ? '/teacher' : 
              isAuthenticated && user?.role === 'student' ? '/student' : 
              '/login'
            } 
            replace 
          />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;