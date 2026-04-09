// src/api/authApi.js
import axios from "axios";

// const API_URL = "http://localhost:8000/api";
const API_URL = import.meta.env.VITE_API_URL; // ← phải gán vào biến


const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const registerApi = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/register`, data, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    console.log("422 errors:", err.response?.data); // ← thêm dòng này
    throw err;
  }
};
export const loginApi = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data, {
    headers: getHeaders(),
  });
  return res.data;
};

export const getMeApi = async (token) => {
  const res = await axios.get(`${API_URL}/me`, {
    headers: getHeaders(token),
  });
  return res.data;
};

export const logoutApi = async (token) => {
  const res = await axios.post(`${API_URL}/logout`, {}, {
    headers: getHeaders(token),
  });
  return res.data;
};