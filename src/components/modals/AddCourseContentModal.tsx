import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface AddCourseContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCourseContentModal = ({ isOpen, onClose }: AddCourseContentModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [courseContents, setCourseContents] = useState<any[]>([]);

  // Fetch course contents when modal opens or after adding new content
  useEffect(() => {
    if (isOpen) {
      fetchContents();
    }
    // eslint-disable-next-line
  }, [isOpen]);

  const fetchContents = async () => {
    try {
      const response = await axios.get('http://localhost/E-learning/api/content/get_course_content.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setCourseContents(response.data.contents);
      }
    } catch {}
  };

  const handleAddQuestion = () => {
    if (currentQuestion.trim() && options.every(opt => opt.trim())) {
      const newQuestion: Question = {
        id: Date.now().toString(),
        text: currentQuestion,
        options: [...options],
        correctAnswer
      };
      setQuestions([...questions, newQuestion]);
      setCurrentQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      const newContent = {
        title,
        content,
        questions
      };
      try {
        const response = await axios.post(
          'http://localhost/E-learning/api/content/add_course_content.php',
          newContent,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (response.data.success) {
          setTitle('');
          setContent('');
          setQuestions([]);
          onClose();
          alert('Content saved successfully!');
          await fetchContents();
        } else {
          alert('Failed to save content');
        }
      } catch {
        alert('Error saving content');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="relative w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-blue-700">Add Course Content</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Content Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition min-h-[100px]"
                required
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t-2 border-dashed border-blue-100 pt-8">
            <h4 className="text-xl font-bold text-blue-600 mb-6">Questions</h4>
            {/* Add Question Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Question Text</label>
                <input
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Options</label>
                <div className="grid grid-cols-2 gap-2">
                  {options.map((option, index) => (
                    <label key={index} className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctAnswer === index}
                        onChange={() => setCorrectAnswer(index)}
                        className="mr-2 accent-blue-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 bg-transparent border-none focus:ring-0"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full md:w-auto mt-2 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
            >
              <PlusIcon className="h-5 w-5" />
              Add Question
            </button>

            {/* Questions List */}
            <div className="space-y-4 mt-8">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-blue-700">Question {index + 1}</p>
                      <p className="text-gray-700 mt-1 font-medium">{question.text}</p>
                      <ul className="mt-2 space-y-1">
                        {question.options.map((opt, i) => (
                          <li key={i} className={`text-sm ${i === question.correctAnswer ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                            {i === question.correctAnswer ? '✓ ' : ''}{opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white z-10 flex justify-end gap-4 pt-8 border-t-2 border-dashed border-blue-100 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow transition"
            >
              Save Content
            </button>
          </div>
        </form>

        {courseContents.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-bold text-blue-700 mb-4">Your Added Course Content</h3>
            {courseContents.map(content => (
              <div key={content.id} className="mb-6 p-4 bg-gray-50 rounded-xl border">
                <h4 className="text-lg font-bold text-blue-700">{content.title}</h4>
                <p className="mb-2">{content.content}</p>
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Questions:</h5>
                  {content.questions.map((q: any) => (
                    <div key={q.id} className="mb-2">
                      <div className="font-medium">{q.question_text}</div>
                      <ul>
                        {q.options.map((opt: string, idx: number) => (
                          <li key={idx} className={idx === q.correct_answer ? 'text-green-600 font-semibold' : ''}>
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCourseContentModal; 