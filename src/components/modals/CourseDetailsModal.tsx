import React from 'react';
import { XMarkIcon, BookOpenIcon, DocumentTextIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: number;
    name: string;
    code: string;
    description: string;
    credits: number;
    status: string;
    schedule: any;
    prerequisites: any[];
    department: string;
    school: string;
    instructor: string;
    instructorId: number;
    isEnrolled: boolean;
    content?: {
      id: string;
      title: string;
      type: string;
      description: string;
      duration?: string;
      completed?: boolean;
    }[];
  } | null;
  onEnroll: (courseId: number) => Promise<void>;
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  isOpen,
  onClose,
  course,
  onEnroll,
}) => {
  if (!isOpen || !course) return null;

  const handleEnroll = async () => {
    try {
      await onEnroll(course.id);
      onClose();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{course.name}</h2>
            <p className="text-gray-600">{course.code}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Course Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{course.description}</p>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Course Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Credits:</span> {course.credits}</p>
                <p><span className="font-medium">Department:</span> {course.department}</p>
                <p><span className="font-medium">School:</span> {course.school}</p>
                <p><span className="font-medium">Instructor:</span> {course.instructor}</p>
              </div>
            </div>

            {/* Schedule Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Schedule</h3>
              {course.schedule ? (
                <div className="space-y-2">
                  {Object.entries(course.schedule).map(([day, time]) => (
                    <p key={day}><span className="font-medium">{day}:</span> {time}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Schedule not available</p>
              )}
            </div>
          </div>

          {/* Course Content */}
          {course.content && course.content.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Content</h3>
              <div className="space-y-4">
                {course.content.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {item.type === 'video' ? (
                          <VideoCameraIcon className="h-6 w-6 text-blue-500" />
                        ) : item.type === 'document' ? (
                          <DocumentTextIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <BookOpenIcon className="h-6 w-6 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        {item.duration && (
                          <p className="text-sm text-gray-500 mt-1">Duration: {item.duration}</p>
                        )}
                      </div>
                      {item.completed && (
                        <span className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Prerequisites</h3>
              <ul className="list-disc list-inside text-gray-600">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Enrollment Button */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
            {!course.isEnrolled && (
              <button
                onClick={handleEnroll}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal; 