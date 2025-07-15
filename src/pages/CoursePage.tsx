import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpenIcon, PencilSquareIcon, CheckCircleIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface CourseContent {
  id: string;
  title: string;
  content: string;
}

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState<CourseContent[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost/E-learning/api/courses/get_content.php?course_id=${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch course content');
        const data = await response.json();
        if (data.success) {
          setContent(data.data || []);
          setEditContent(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch course content');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch course content');
        } else {
          setError('Failed to fetch course content');
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchContent();
  }, [id]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  // Placeholder for save logic
  const handleSave = () => {
    // TODO: Implement save logic (POST/PUT to backend)
    setContent(editContent);
    setEditMode(false);
  };

  if (loading) return <div className="p-8 text-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-start py-0 sm:py-8">
      {/* Back Button */}
      <div className="w-full max-w-3xl flex items-center mb-4 px-4 sm:px-0 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl shadow border border-blue-100 transition-all"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
      </div>
      {/* Main Content Card */}
      <div className="w-full max-w-3xl bg-white/90 rounded-3xl shadow-2xl border border-blue-100 p-0 sm:p-8 flex flex-col">
        {/* Header */}
        <div className="rounded-b-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-10 flex items-center gap-4 shadow-lg mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20">
            <BookOpenIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Course Content</h1>
            <p className="text-blue-100">Explore and manage the learning materials for this course.</p>
          </div>
        </div>
        {/* Edit Button */}
        {user?.role === 'teacher' && !editMode && (
          <button
            onClick={handleEdit}
            className="mb-6 flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all self-end"
          >
            <PencilSquareIcon className="w-5 h-5" /> Edit Content
          </button>
        )}
        {/* Edit Mode */}
        {editMode ? (
          <div className="space-y-6">
            {editContent.map((item, idx) => (
              <div key={item.id} className="mb-4 p-6 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm">
                <input
                  className="w-full border-2 border-blue-300 rounded-lg p-2 mb-2 text-lg font-semibold focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white"
                  value={item.title}
                  onChange={e => {
                    const newContent = [...editContent];
                    newContent[idx].title = e.target.value;
                    setEditContent(newContent);
                  }}
                  placeholder="Section Title"
                />
                <textarea
                  className="w-full border-2 border-blue-200 rounded-lg p-2 min-h-[80px] focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white"
                  value={item.content}
                  onChange={e => {
                    const newContent = [...editContent];
                    newContent[idx].content = e.target.value;
                    setEditContent(newContent);
                  }}
                  placeholder="Section Content"
                />
              </div>
            ))}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition-all"
              >
                <CheckCircleIcon className="w-5 h-5" /> Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow transition-all"
              >
                <XMarkIcon className="w-5 h-5" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {content.length === 0 ? (
              <div className="text-gray-500 text-center">No content available for this course yet.</div>
            ) : (
              content.map(item => (
                <div key={item.id} className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpenIcon className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-blue-900">{item.title}</h2>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{item.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePage; 