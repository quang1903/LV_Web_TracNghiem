// src/hooks/useHome.js
import { useEffect, useState } from "react";
import axios from "axios";

// cấu hình Axios để gửi cookie tới Laravel
axios.defaults.withCredentials = true; // quan trọng!

export default function useHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1️⃣ Lấy CSRF cookie từ Laravel Sanctum
    // axios.get("http://localhost:8000/sanctum/csrf-cookie")
    axios.get(`${import.meta.env.VITE_API_URL}/sanctum/csrf-cookie`)
      .then(() => {
        // 2️⃣ Gọi API login test (nếu bạn đã có user)
        // return axios.post("http://localhost:8000/login", {
        return axios.post(`${import.meta.env.VITE_API_URL}/login`, {
          email: "test@example.com",
          password: "password123"
        });
      })
      .then(() => {
        // 3️⃣ Gọi API /api/home sau khi đã login
        // return axios.get("http://localhost:8000/api/home");
        return axios.get(`${import.meta.env.VITE_API_URL}/api/home`);
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError(err.response ? err.response.status : "Network Error");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}