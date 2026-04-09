// api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  // baseURL: "http://localhost:8000/api",
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ✅ Request interceptor: Tự động thêm token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor xử lý lỗi 401 và 403
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      // window.location.href = "/login";
    }
    
    // Xử lý lỗi 403
    if (error.response?.status === 403) {
      console.error("Forbidden:", error.response?.data?.message || "Bạn không có quyền thực hiện hành động này");
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;