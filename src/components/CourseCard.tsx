import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import CreateAssignmentModal from './modals/CreateAssignmentModal';
import axios from 'axios';

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  isTeacher: boolean;
}

interface Course {
  id: number;
  name: string;
}

const CourseCard = ({ id, title, description, isTeacher }: CourseCardProps) => {
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (isTeacher && isCreateAssignmentModalOpen) {
      axios.get('http://localhost/E-learning/api/courses/get_courses.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => {
        if (res.data.success && res.data.courses) {
          setCourses(res.data.courses.map((c: any) => ({ id: c.id, name: c.name || c.title })));
        }
      });
    }
  }, [isTeacher, isCreateAssignmentModalOpen]);

  const handleAssignmentCreated = () => {
    // You can add any refresh logic here if needed
    console.log('Assignment created successfully');
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
          
          <div className="flex justify-between items-center">
            <Link
              to={`/course/${id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Course
            </Link>
            
            {isTeacher && (
              <button
                onClick={() => setIsCreateAssignmentModalOpen(true)}
                className="flex items-center gap-2 text-green-600 hover:text-green-800 font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Create Assignment
              </button>
            )}
          </div>
        </div>
      </div>

      <CreateAssignmentModal
        isOpen={isCreateAssignmentModalOpen}
        onClose={() => setIsCreateAssignmentModalOpen(false)}
        onAssignmentCreated={handleAssignmentCreated}
        courses={courses}
      />
    </>
  );
};

export default CourseCard; 