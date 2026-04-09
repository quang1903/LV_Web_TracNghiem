// src/components/teacher/ImportModal.jsx
import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';

const ImportModal = ({ isOpen, onClose, examId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Kiểm tra kích thước file (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File quá lớn. Vui lòng chọn file dưới 10MB');
        setFile(null);
        return;
      }
      
      // Kiểm tra định dạng
      const allowedTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const allowedExtensions = ['.doc', '.docx', '.txt'];
      const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(ext)) {
        setError('Chỉ hỗ trợ file .doc, .docx, .txt');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Vui lòng chọn file');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const res = await axiosClient.post(`/exams/${examId}/import-questions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      
      if (res.data.success) {
        alert(res.data.message);
        onSuccess(); // Tải lại danh sách câu hỏi
        onClose(); // Đóng modal
        setFile(null);
        setUploadProgress(0);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi import file');
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const sample = `1. Câu hỏi số 1
A. Đáp án A
B. *Đáp án B đúng
C. Đáp án C
D. Đáp án D

2. Câu hỏi số 2
A. Đáp án A
B. Đáp án B
C. ✓Đáp án C đúng
D. Đáp án D

3. Câu hỏi số 3
A. Đáp án A
B. (Đúng) Đáp án B đúng
C. Đáp án C
D. Đáp án D

4. Câu hỏi có đáp án in đậm
A. Đáp án A
B. **Đáp án B đúng**
C. Đáp án C
D. Đáp án D

5. Câu hỏi có nhiều dòng
   Dòng thứ hai của câu hỏi
   Dòng thứ ba
A. Đáp án A
B. *Đáp án B đúng
C. Đáp án C
D. Đáp án D`;
    
    const blob = new Blob([sample], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mau_cau_hoi.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import câu hỏi từ file</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        {/* Hướng dẫn */}
        <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
          <p className="font-medium text-blue-800 mb-2">📌 Hướng dẫn định dạng file:</p>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>Câu hỏi: <code className="bg-blue-100 px-1">1. Nội dung</code> hoặc <code className="bg-blue-100 px-1">Câu 1: Nội dung</code></li>
            <li>Đáp án: <code className="bg-blue-100 px-1">A. Nội dung</code>, <code className="bg-blue-100 px-1">B. Nội dung</code>, ...</li>
            <li>Đánh dấu đáp án đúng: <code className="bg-blue-100 px-1">*</code>, <code className="bg-blue-100 px-1">✓</code>, <code className="bg-blue-100 px-1">(Đúng)</code>, hoặc <strong>in đậm</strong></li>
          </ul>
          <button 
            onClick={downloadSample}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            📥 Tải file mẫu
          </button>
        </div>
        
        {/* Chọn file */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Chọn file Word (.doc, .docx) hoặc text (.txt)</label>
          <input
            type="file"
            accept=".doc,.docx,.txt"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          {file && (
            <p className="text-sm text-green-600 mt-1">
              Đã chọn: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
        
        {/* Lỗi */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            ❌ {error}
          </div>
        )}
        
        {/* Progress bar */}
        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Đang tải lên...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!file || uploading}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? 'Đang import...' : 'Import'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
        </div>
        
        {/* Lưu ý */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          * Hỗ trợ tối đa 300 câu hỏi/lần, file tối đa 10MB
        </p>
      </div>
    </div>
  );
};

export default ImportModal;