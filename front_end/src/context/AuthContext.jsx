// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

// Hàm helper để kiểm soát log
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const devError = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axiosClient.get('/me');
      
      devLog('Fetch user response:', response.data);
      
      const responseData = response.data;
      
      // Kiểm tra success flag từ backend
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to fetch user');
      }
      
      // Lấy user từ response.data.data
      let userData = responseData.data;
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      devError('Fetch user error:', error);
      localStorage.removeItem('token');
      delete axiosClient.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosClient.post('/login', { email, password });
      
      devLog('Login response:', response.data);
      
      const responseData = response.data;
      
      // Kiểm tra success flag từ backend
      if (!responseData.success) {
        return { 
          success: false, 
          message: responseData.message || 'Đăng nhập thất bại' 
        };
      }
      
      // Lấy data từ response (chứa token và user)
      const data = responseData.data;
      
      // Lấy token và user từ data
      const token = data?.access_token;
      let userData = data?.user;
      
      if (!token || !userData) {
        devError('Invalid response structure:', responseData);
        return { success: false, message: 'Dữ liệu trả về không hợp lệ' };
      }
      
      // Lưu token
      localStorage.setItem('token', token);
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      devError('Login error:', error);
      
      // Xử lý lỗi từ backend
      let message = 'Đăng nhập thất bại';
      
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        if (status === 401) {
          message = responseData?.message || 'Email hoặc mật khẩu không đúng';
        } else if (status === 422) {
          // Validation errors
          const errors = responseData?.errors;
          if (errors && typeof errors === 'object') {
            message = Object.values(errors).flat().join(', ');
          } else {
            message = responseData?.message || 'Dữ liệu không hợp lệ';
          }
        } else if (status === 429) {
          message = 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.';
        } else {
          message = responseData?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        }
      } else if (error.request) {
        message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      }
      
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        name: userData.fullName,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.confirmPassword,
        role: userData.role || 'student',
        student_code: userData.studentCode || null,
      };
      
      devLog('Register payload:', payload);
      
      const response = await axiosClient.post('/register', payload);
      
      devLog('Register response:', response.data);
      
      const responseData = response.data;
      
      // Kiểm tra success flag
      if (!responseData.success) {
        // Xử lý validation errors
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors).flat().join(', ');
          return { 
            success: false, 
            message: errorMessages 
          };
        }
        return { 
          success: false, 
          message: responseData.message || 'Đăng ký thất bại' 
        };
      }
      
      // Đăng ký thành công
      return { 
        success: true, 
        message: responseData.message || 'Đăng ký thành công! Vui lòng đăng nhập.' 
      };
      
    } catch (error) {
      devError('Register error:', error);
      
      let message = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        if (status === 422) {
          // Validation errors
          const errors = responseData?.errors;
          if (errors && typeof errors === 'object') {
            message = Object.values(errors).flat().join(', ');
          } else {
            message = responseData?.message || 'Dữ liệu không hợp lệ';
          }
        } else if (status === 409) {
          message = responseData?.message || 'Email đã tồn tại';
        } else {
          message = responseData?.message || 'Đã có lỗi xảy ra khi đăng ký';
        }
      } else if (error.request) {
        message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.';
      }
      
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axiosClient.post('/logout');
      }
    } catch (error) {
      devError('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axiosClient.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axiosClient.put('/profile', profileData);
      
      const responseData = response.data;
      
      if (!responseData.success) {
        return { 
          success: false, 
          message: responseData.message || 'Cập nhật thất bại' 
        };
      }
      
      // Cập nhật user state
      const updatedUser = responseData.data;
      setUser(updatedUser);
      
      // Cập nhật localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { 
        success: true, 
        message: responseData.message || 'Cập nhật thành công',
        user: updatedUser
      };
      
    } catch (error) {
      devError('Update profile error:', error);
      
      let message = 'Cập nhật thất bại';
      
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        if (status === 422) {
          const errors = responseData?.errors;
          if (errors && typeof errors === 'object') {
            message = Object.values(errors).flat().join(', ');
          } else {
            message = responseData?.message || 'Dữ liệu không hợp lệ';
          }
        } else {
          message = responseData?.message || 'Đã có lỗi xảy ra';
        }
      }
      
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};