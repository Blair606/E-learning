import React from 'react';
import { XMarkIcon, BookOpenIcon, DocumentTextIcon, VideoCameraIcon, CodeBracketIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface Schedule {
    day: string;
    time: string;
    duration: number;
}

interface CourseContent {
    id: string;
    title: string;
    content: string;
    questions: Array<{
        id: string;
        text: string;
        options: string[];
        correctAnswer: number;
        completed?: boolean;
        selectedAnswer?: number;
    }>;
    completed?: boolean;
}

interface Course {
    id: number;
    name: string;
    code: string;
    description: string;
    credits: number;
    status: string;
    schedule: Schedule[];
    prerequisites: string[];
    department: string;
    school: string;
    instructor: string;
    instructorId: number;
    isEnrolled: boolean;
}

interface CourseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    content: CourseContent[];
    contentLoading: boolean;
    onEnroll?: () => void;
    isEnrolled?: boolean;
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
    isOpen,
    onClose,
    course,
    content,
    contentLoading,
    onEnroll,
    isEnrolled
}) => {
    if (!isOpen) return null;

    const getContentIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('video') || lowerTitle.includes('lecture')) {
            return <VideoCameraIcon className="h-6 w-6 text-blue-500" />;
        } else if (lowerTitle.includes('document') || lowerTitle.includes('pdf')) {
            return <DocumentIcon className="h-6 w-6 text-green-500" />;
        } else if (lowerTitle.includes('article') || lowerTitle.includes('reading')) {
            return <DocumentTextIcon className="h-6 w-6 text-purple-500" />;
        } else if (lowerTitle.includes('code') || lowerTitle.includes('programming')) {
            return <CodeBracketIcon className="h-6 w-6 text-orange-500" />;
        } else {
            return <BookOpenIcon className="h-6 w-6 text-gray-500" />;
        }
    };

    const formatSchedule = (schedule: Schedule[]) => {
        return schedule.map(s => `${s.day} ${s.time} (${s.duration} mins)`).join('\n');
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
                                <p><span className="font-medium">Status:</span> {course.status}</p>
                            </div>
                        </div>

                        {/* Schedule Information */}
                        {course.schedule && course.schedule.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Schedule</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-600 whitespace-pre-line">
                                        {formatSchedule(course.schedule)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Course Content */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Content</h3>
                        {contentLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : content.length === 0 ? (
                            <p className="text-gray-500">No content available for this course yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {content.map((item) => (
                                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                {getContentIcon(item.title)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800">{item.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Prerequisites */}
                    {course.prerequisites && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Prerequisites</h3>
                            <p className="text-gray-600 whitespace-pre-line">{course.prerequisites.join(', ')}</p>
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
                        {!isEnrolled && onEnroll && (
                            <button
                                onClick={onEnroll}
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