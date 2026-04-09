// src/api/answerApi.js
import axiosClient from './axiosClient';

// Lấy danh sách answers
export const getAnswers = async (params = {}) => {
  const res = await axiosClient.get('/answers', { params });
  return res.data;
};

// Lấy chi tiết answer
export const getAnswer = async (id) => {
  const res = await axiosClient.get(`/answers/${id}`);
  return res.data;
};

// Tạo answer mới
export const createAnswer = async (data) => {
  const res = await axiosClient.post('/answers', data);
  return res.data;
};

// Cập nhật answer
export const updateAnswer = async (id, data) => {
  const res = await axiosClient.put(`/answers/${id}`, data);
  return res.data;
};

// Xóa answer
export const deleteAnswer = async (id) => {
  const res = await axiosClient.delete(`/answers/${id}`);
  return res.data;
};

// Lấy answers theo question
export const getAnswersByQuestion = async (questionId) => {
  const res = await axiosClient.get(`/answers/question/${questionId}`);
  return res.data;
};