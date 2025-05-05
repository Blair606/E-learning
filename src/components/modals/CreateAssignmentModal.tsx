import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import type { Assignment } from '../../services/teacherService';

interface Course {
  id: number;
  name: string;
}

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentCreated: (assignment: Assignment) => void;
  courses: Course[];
}

const CreateAssignmentModal = ({ isOpen, onClose, onAssignmentCreated, courses }: CreateAssignmentModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [courseId, setCourseId] = useState('');
  const [type, setType] = useState('text');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id.toString());
    }
  }, [courses, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('due_date', dueDate);
      formData.append('total_marks', totalMarks);
      formData.append('course_id', courseId);
      formData.append('type', type);
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post(
        'http://localhost/E-learning/api/assignments/create_assignment.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          validateStatus: () => true
        }
      );

      if (response.status === 200 && response.data.success) {
        const selectedCourse = courses.find(c => c.id.toString() === courseId);
        const newAssignment: Assignment = {
          id: response.data.assignment_id,
          title: title,
          description: description,
          due_date: dueDate,
          total_marks: parseInt(totalMarks),
          type: type,
          status: 'Active',
          submissions: 0,
          course_id: parseInt(courseId),
          course_name: selectedCourse?.name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        onAssignmentCreated(newAssignment);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setDueDate('');
        setTotalMarks('');
        setCourseId(courses.length > 0 ? courses[0].id.toString() : '');
        setType('text');
        setFile(null);
      } else {
        setError(response.data?.message || response.data?.error || 'Failed to create assignment');
        console.error('Assignment creation error:', response);
      }
    } catch (err) {
      console.error('Assignment creation error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while creating the assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto">
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 my-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-blue-700">Create Assignment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Course</label>
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

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
            <label className="block font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            >
              <option value="text">Text Submission</option>
              <option value="file">File Submission</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          {type === 'file' && (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Assignment File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                required={type === 'file'}
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Total Marks</label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              min="1"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal; 