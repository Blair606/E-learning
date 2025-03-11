import { useState } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface CourseContent {
  id: string;
  title: string;
  content: string;
  questions: Question[];
}

interface AddCourseContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: CourseContent) => void;
  courseId: number;
}

const AddCourseContentModal = ({ isOpen, onClose, onSubmit, courseId }: AddCourseContentModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      const newContent: CourseContent = {
        id: Date.now().toString(),
        title,
        content,
        questions
      };
      onSubmit(newContent);
      setTitle('');
      setContent('');
      setQuestions([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[95%] max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Course Content</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Questions Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Questions</h4>
            
            {/* Add Question Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                <input
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctAnswer === index}
                        onChange={() => setCorrectAnswer(index)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
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
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Question
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Question {index + 1}</p>
                      <p className="text-gray-600 mt-1">{question.text}</p>
                      <ul className="mt-2 space-y-1">
                        {question.options.map((opt, i) => (
                          <li key={i} className={`text-sm ${i === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
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

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseContentModal; 