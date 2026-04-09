// src/pages/teacher/QuestionManager.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import ImportModal from '../../components/teacher/ImportModal';

const QuestionManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const examId = searchParams.get('exam_id');

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [answers, setAnswers] = useState([
    { content: '', is_correct: false }, { content: '', is_correct: false },
    { content: '', is_correct: false }, { content: '', is_correct: false },
  ]);

  useEffect(() => { loadExams(); }, []);
  useEffect(() => {
    if (examId) loadQuestions(examId);
    else { setQuestions([]); setSelectedExam(null); }
  }, [examId]);

  const loadExams = async () => {
    try {
      const res = await axiosClient.get('/exams');
      setExams(res.data?.data || res.data || []);
    } catch (e) { console.error(e); }
  };

  const loadQuestions = async (id) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/questions?exam_id=${id}`);
      setSelectedExam(exams.find(e => e.id == id));
      setQuestions(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setEditingQuestion(null); setContent('');
    setAnswers([
      { content: '', is_correct: false }, { content: '', is_correct: false },
      { content: '', is_correct: false }, { content: '', is_correct: false },
    ]);
  };

  const openModal = (q = null) => {
    if (q) {
      setEditingQuestion(q); setContent(q.content);
      const a = [...q.answers];
      while (a.length < 4) a.push({ content: '', is_correct: false });
      setAnswers(a.map(x => ({ content: x.content, is_correct: x.is_correct === 1 || x.is_correct === true })));
    } else { resetForm(); }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { alert('Vui lòng nhập nội dung câu hỏi'); return; }
    if (!answers.some(a => a.is_correct)) { alert('Phải có ít nhất 1 đáp án đúng'); return; }
    setSubmitting(true);
    const payload = { exam_id: parseInt(examId), content, answers: answers.map(a => ({ content: a.content, is_correct: a.is_correct })) };
    try {
      if (editingQuestion) {
        await axiosClient.put(`/questions/${editingQuestion.id}`, payload);
        alert('Cập nhật thành công');
        setQuestions(questions.map(q => q.id === editingQuestion.id ? { ...q, content, answers: payload.answers } : q));
      } else {
        const res = await axiosClient.post('/questions', payload);
        alert('Thêm thành công');
        setQuestions([...questions, res.data?.data]);
      }
      setShowModal(false); resetForm();
    } catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, qContent) => {
    if (!window.confirm(`Xóa câu hỏi này?`)) return;
    try {
      await axiosClient.delete(`/questions/${id}`);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (e) { alert(e.response?.data?.message || 'Lỗi xóa'); }
  };

  const updateAnswer = (idx, field, value) => {
    const a = [...answers];
    a[idx][field] = field === 'is_correct' ? value === 'true' : value;
    setAnswers(a);
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Quản lý câu hỏi</h1>

      {/* Exam selector */}
      <div className="bg-white rounded shadow p-3 mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Chọn bài thi</label>
        <div className="flex gap-2">
          <select value={examId || ''} onChange={e => e.target.value ? setSearchParams({ exam_id: e.target.value }) : setSearchParams({})}
            className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Chọn bài thi --</option>
            {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} - {ex.subject?.name}</option>)}
          </select>
          {examId && (
            <button onClick={() => setShowImportModal(true)}
              className="flex-shrink-0 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
              Import
            </button>
          )}
        </div>
      </div>

      {examId ? (
        loading ? <div className="text-center py-10 text-sm">Đang tải...</div> : (
          <>
            <div className="flex justify-between items-center mb-3 gap-2">
              <p className="text-sm text-gray-600">
                <strong>{selectedExam?.title}</strong>
                <span className="text-gray-400 ml-1">({questions.length} câu)</span>
              </p>
              <button onClick={() => openModal()}
                className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex-shrink-0">
                + Thêm
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="bg-white rounded shadow p-8 text-center">
                <p className="text-gray-500 mb-4 text-sm">Chưa có câu hỏi</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Thêm thủ công</button>
                  <button onClick={() => setShowImportModal(true)} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Import Word</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded shadow p-4">
                    <div className="flex justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-snug">
                          <span className="text-blue-600">Câu {idx + 1}:</span> {q.content}
                        </p>
                        <div className="mt-2 space-y-1">
                          {q.answers?.map((a, ai) => (
                            <p key={a.id} className={`text-xs ${a.is_correct ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                              {String.fromCharCode(65 + ai)}. {a.content} {a.is_correct && '✓'}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button onClick={() => openModal(q)}
                          className="px-3 py-1.5 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600">Sửa</button>
                        <button onClick={() => handleDelete(q.id, q.content)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600">Xóa</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      ) : (
        <div className="bg-white rounded shadow p-10 text-center text-gray-500 text-sm">
          Vui lòng chọn bài thi để quản lý câu hỏi
        </div>
      )}

      {/* Question modal — bottom sheet on mobile */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="sm:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-4">{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h2>
            <form onSubmit={handleSubmit}>
              <textarea rows="3" placeholder="Nội dung câu hỏi"
                className="w-full p-2.5 border rounded-lg mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={content} onChange={e => setContent(e.target.value)} required />
              <p className="text-xs font-medium text-gray-600 mb-2">Đáp án</p>
              {answers.map((ans, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <span className="text-sm text-gray-500 w-5 flex-shrink-0">{String.fromCharCode(65 + idx)}.</span>
                  <input type="text"
                    className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                    value={ans.content} onChange={e => updateAnswer(idx, 'content', e.target.value)} required />
                  <select
                    className="w-16 p-2 border rounded text-xs flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={String(ans.is_correct)} onChange={e => updateAnswer(idx, 'is_correct', e.target.value)}>
                    <option value="false">Sai</option>
                    <option value="true">Đúng</option>
                  </select>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
                  {submitting ? 'Đang lưu...' : editingQuestion ? 'Cập nhật' : 'Thêm'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2.5 bg-gray-200 rounded-lg text-sm hover:bg-gray-300">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)}
        examId={examId} onSuccess={() => loadQuestions(examId)} />
    </div>
  );
};

export default QuestionManager;