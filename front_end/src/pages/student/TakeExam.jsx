import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const TakeExam = () => {
  const { examId, attemptId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, [examId, attemptId]);

  const fetchQuestions = async () => {
    try {
      const res = await axiosClient.get(`/attempts/${attemptId}/questions`);
      setQuestions(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Không thể tải câu hỏi");
      navigate("/student/exams");
    }
  };

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    try {
      for (let q of questions) {
        await axiosClient.post(`/attempts/${attemptId}/questions/${q.id}/answer`, {
          answer: answers[q.id] || null,
        });
      }
      await axiosClient.post(`/attempts/${attemptId}/submit`);
      navigate(`/student/exam/${examId}/attempt/${attemptId}/result`);
    } catch (err) {
      console.error(err);
      alert("Không thể nộp bài");
    }
  };

  if (!questions.length) return <div>Loading...</div>;

  return (
    <div>
      <h1>Làm bài</h1>
      {questions.map((q) => (
        <div key={q.id}>
          <p>{q.content}</p>
          {q.answers.map((a) => (
            <label key={a.id}>
              <input
                type="radio"
                name={`question-${q.id}`}
                value={a.id}
                checked={answers[q.id] === a.id}
                onChange={() => handleChange(q.id, a.id)}
              />
              {a.content}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Nộp bài</button>
    </div>
  );
};

export default TakeExam;