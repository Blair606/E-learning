import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDiscussionGroups } from '../../services/discussionService';
import { courseService } from '../../services/courseService';
import { getMaterialsByClassId, downloadMaterial, ClassMaterial } from '../../services/materialService';
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ChartBarIcon,
  BanknotesIcon,
  UserCircleIcon,
  BookmarkIcon,
  DocumentIcon,
  Bars3Icon,
  XMarkIcon,
  VideoCameraIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import EditStudentProfileModal from '../../components/modals/EditStudentProfileModal';
import CourseDetailsModal from '../../components/modals/CourseDetailsModal';
import AddGuardianModal from '../../components/modals/AddGuardianModal';
import type { User } from '../../types/user';

const menuItems = [
  { id: 'courses', icon: BookOpenIcon, label: 'Courses' },
  { id: 'schedule', icon: CalendarIcon, label: 'Schedule' },
  { id: 'profile', icon: UserCircleIcon, label: 'Profile' },
  { id: 'discussions', icon: ChatBubbleLeftRightIcon, label: 'Discussions' },
  { id: 'notifications', icon: BellIcon, label: 'Notifications' },
  { id: 'academic', icon: ChartBarIcon, label: 'Academic Progress' },
  { id: 'financial', icon: BanknotesIcon, label: 'Financial Status' },
  { id: 'resources', icon: BookmarkIcon, label: 'Resources' },
  { id: 'online-classes', icon: VideoCameraIcon, label: 'Online Classes' },
];

interface DiscussionTopic {
  id: number;
  title: string;
  lastMessage: string;
  replies: number;
  unread: number;
  timestamp: string;
}

interface DiscussionGroup {
  id: number;
  name: string;
  course: string;
  courseCode: string;
  members: number;
  lastActive: string;
  topics: DiscussionTopic[];
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  completed?: boolean;
  selectedAnswer?: number;
}

interface CourseContent {
  id: string;
  title: string;
  content: string;
  questions: Question[];
  completed?: boolean;
}

interface Unit {
  id: number;
  code: string;
  name: string;
  instructor: string;
  progress: number;
  nextClass: string;
  content: CourseContent[];
  resources: { id: number; title: string; type: string; downloadUrl: string; }[];
  assignments: { id: number; title: string; dueDate: string; status: string; }[];
}

interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  credits: number;
  status: string;
  schedule: Array<{
    day: string;
    time: string;
    duration: number;
  }>;
  prerequisites: string[];
  department: string;
  school: string;
  instructor: string;
  instructorId: number;
  isEnrolled: boolean;
  classId: number; // Added classId
}

interface ScheduleData {
  regular_schedule: Array<{
    id: number;
    name: string;
    code: string;
    instructor: string;
    schedule: Array<{
      day: string;
      time: string;
      duration: number;
    }>;
  }>;
  online_classes: Array<{
    id: number;
    title: string;
    course_name: string;
    course_code: string;
    instructor: string;
    date: string;
    time: string;
    duration: number;
    meeting_link: string;
  }>;
}

interface Guardian {
  id: number;
  firstName: string;
  lastName: string;
  relationship: string;
  email: string;
  phoneNumber: string;
  address: string;
}
interface Notification {
  id: number;
  message: string;
  teacher?: string;
  time?: string;
}
interface Grade {
  course: string;
  percentage: number;
  credits: number;
  originalSemester?: string;
  retakeSemester?: string;
  originalGrade?: number;
  improvedGrade?: number;
  status?: string;
}
interface FinancialStatus {
  semesterFee: number;
  nextPaymentDeadline?: string;
  tuitionStatus?: string;
  hostelFee?: {
    amount: number;
    deadline?: string;
    status?: string;
  };
  retakesFee?: {
    pendingUnits: { code: string; name: string; amount: number }[];
  };
  paymentHistory?: { id: number; type: string; date: string; amount: number; status: string }[];
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('courses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [studentData, setStudentData] = useState<User | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [discussionGroups, setDiscussionGroups] = useState<DiscussionGroup[]>([]);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [classMaterials, setClassMaterials] = useState<ClassMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [financialStatus, setFinancialStatus] = useState<FinancialStatus | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DiscussionGroup | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(null);
  const [scheduledClasses, setScheduledClasses] = useState<any[]>([]); // You can type this better if you have a class type

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`http://localhost/E-learning/api/students/read.php?user_id=${user?.id}`, {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }
        
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          setStudentData(result.data);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    if (user?.id) {
      fetchStudentData();
    }
  }, [user]);

  // Add this new useEffect for fetching courses
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!selectedCourse?.id) {
        setClassMaterials([]);
        return;
      }
      try {
        setMaterialsLoading(true);
        setMaterialsError(null);
        const materials = await getMaterialsByClassId(selectedCourse.id);
        setClassMaterials(materials);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setMaterialsError('Failed to load class materials');
      } finally {
        setMaterialsLoading(false);
      }
    };

    fetchMaterials();
  }, [selectedCourse?.id]);

  const handleDownload = async (materialId: number) => {
    try {
      await downloadMaterial(materialId);
    } catch (error) {
      console.error('Error downloading material:', error);
      // You might want to show a toast notification here
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost/E-learning/api/courses/get_student_courses.php', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        if (data.success) {
          // Update to use data.courses instead of data.data
          setCourses(data.courses || []);
        } else {
          throw new Error(data.message || 'Failed to fetch courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Add this new useEffect for fetching schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setScheduleLoading(true);
        const response = await fetch('http://localhost/E-learning/api/students/get_schedule.php', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }

        const data = await response.json();
        if (data.success) {
          setScheduleData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch schedule');
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch schedule');
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost/E-learning/api/notifications/read.php?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) setNotifications(data.data);
      });
  }, [user]);

  // Fetch grades (academic results)
  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost/E-learning/api/grades/index.php?student_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGrades(data);
      });
  }, [user]);

  // Fetch financial status (if endpoint exists)
  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost/E-learning/api/students/financial_status.php?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setFinancialStatus(data.data);
      })
      .catch(() => setFinancialStatus(null));
  }, [user]);

  // Add enrollment handler
  const handleEnroll = async (courseId: number) => {
    try {
      // First, get the student's ID from the database
      const studentResponse = await fetch(`http://localhost/E-learning/api/students/read.php?user_id=${user?.id}`, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!studentResponse.ok) {
        throw new Error('Failed to fetch student data');
      }

      const studentData = await studentResponse.json();
      if (!studentData.data || !studentData.data.id) {
        throw new Error('Student data not found');
      }

      // Create enrollment data object
      const enrollmentData = {
        course_id: courseId,
        student_id: studentData.data.id,
      };

      // Now enroll in the course
      const response = await courseService.enrollCourse(courseId, user.id);
      
      if (response.success) {
        // Update the courses list to reflect the enrollment
        setCourses(courses.map(course => 
          course.id === courseId ? { ...course, isEnrolled: true } : course
        ));

        // Create notification data object
        const notificationData = {
          user_id: user?.id,
          title: 'Course Enrollment Successful',
          message: `You have successfully enrolled in ${selectedCourse?.name}. You can now access the course materials and participate in class activities.`,
          type: 'success'
        };

        // Create notification
        const notificationResponse = await fetch('http://localhost/E-learning/api/notifications/create.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(notificationData)
        });

        if (!notificationResponse.ok) {
          console.error('Failed to create notification');
        }

        // Close the modal after successful enrollment
        setIsCourseModalOpen(false);
        setSelectedCourse(null);
      } else {
        throw new Error(response.message || 'Failed to enroll in course');
      }
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      setError(error.message || 'Failed to enroll in course');
    }
  };

  // Add fetchCourseContent function
  const fetchCourseContent = async (courseId: number) => {
    try {
      setContentLoading(true);
      const response = await fetch(`http://localhost/E-learning/api/courses/get_content.php?course_id=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course content');
      }

      const data = await response.json();
      if (data.success) {
        setCourseContent(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch course content');
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch course content');
    } finally {
      setContentLoading(false);
    }
  };

  // Add function to fetch discussion groups
  const fetchDiscussionGroups = async (courseId: number) => {
    try {
      setDiscussionLoading(true);
      const groups = await getDiscussionGroups(courseId);
      setDiscussionGroups(groups);
    } catch (error) {
      console.error('Error fetching discussion groups:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch discussion groups');
    } finally {
      setDiscussionLoading(false);
    }
  };

  // Update the handleViewDetails function
  const handleViewDetails = async (course: Course) => {
    setSelectedCourse(course);
    setIsCourseModalOpen(true);
    await Promise.all([
      fetchCourseContent(course.id),
      fetchDiscussionGroups(course.id)
    ]);
  };

  // Add this new function to render the schedule section
  const renderSchedule = () => {
    if (scheduleLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!scheduleData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No schedule data available</p>
        </div>
      );
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayColors = [
      'bg-gradient-to-br from-blue-50 to-blue-100',
      'bg-gradient-to-br from-green-50 to-green-100',
      'bg-gradient-to-br from-yellow-50 to-yellow-100',
      'bg-gradient-to-br from-pink-50 to-pink-100',
      'bg-gradient-to-br from-purple-50 to-purple-100',
    ];
    const hours = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM

    return (
      <div className="rounded-2xl shadow-xl overflow-hidden border border-gray-200 bg-white">
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-white" />
            Weekly Schedule
          </h2>
          <p className="text-blue-100 mt-1">Here’s your personalized class timetable. Click on a class for more details!</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-50">Time</th>
                {days.map((day, i) => (
                  <th key={day} className={`px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${dayColors[i]}`}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {hours.map(hour => (
                <tr key={hour} className="hover:bg-blue-50/40 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                    {`${hour}:00 - ${hour + 1}:00`}
                  </td>
                  {days.map((day, i) => {
                    // Find regular classes at this time
                    const regularClass = scheduleData.regular_schedule.find(course => {
                      return course.schedule.some(slot => {
                        const [startHour] = slot.time.split(':').map(Number);
                        return slot.day === day && startHour === hour;
                      });
                    });

                    // Find online classes at this time
                    const onlineClass = scheduleData.online_classes.find(online => {
                      const classDate = new Date(online.date);
                      const classDay = classDate.toLocaleDateString('en-US', { weekday: 'long' });
                      const [classHour] = online.time.split(':').map(Number);
                      return classDay === day && classHour === hour;
                    });

                    return (
                      <td key={day} className={`px-6 py-4 whitespace-nowrap align-top transition-all duration-200 ${dayColors[i]} rounded-lg`}> 
                        {regularClass && (
                          <div className="p-4 rounded-xl shadow-md bg-white/80 border border-blue-200 hover:scale-105 hover:shadow-lg transition-all cursor-pointer group">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpenIcon className="w-5 h-5 text-blue-500" />
                              <span className="font-bold text-blue-900 group-hover:text-blue-700">{regularClass.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-700 mb-1">
                              <ClockIcon className="w-4 h-4" />
                              {regularClass.schedule.map(slot => slot.day === day && slot.time === `${hour.toString().padStart(2, '0')}:00` ? `${slot.time}` : null)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <UserCircleIcon className="w-4 h-4" />
                              {regularClass.instructor}
                            </div>
                          </div>
                        )}
                        {onlineClass && (
                          <div className="p-4 rounded-xl shadow-md bg-green-50 border border-green-200 mt-2 hover:scale-105 hover:shadow-lg transition-all cursor-pointer group">
                            <div className="flex items-center gap-2 mb-1">
                              <VideoCameraIcon className="w-5 h-5 text-green-600" />
                              <span className="font-bold text-green-900 group-hover:text-green-700">{onlineClass.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-green-700 mb-1">
                              <ClockIcon className="w-4 h-4" />
                              {onlineClass.time}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <UserCircleIcon className="w-4 h-4" />
                              {onlineClass.instructor}
                            </div>
                            {onlineClass.meeting_link && (
                              <a
                                href={onlineClass.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-1 text-xs text-green-700 underline hover:text-green-900"
                              >
                                Join Meeting →
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Update the renderContent function to include the schedule section
  const renderContent = () => {
    switch (activeMenu) {
      case 'courses':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Enroll in New Course
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No courses available for your department.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{course.name}</h3>
                          <p className="text-sm text-gray-500">{course.code}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          course.isEnrolled ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {course.isEnrolled ? 'Enrolled' : 'Available'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500">
                        <p><span className="font-medium">Instructor:</span> {course.instructor}</p>
                        <p><span className="font-medium">Department:</span> {course.department}</p>
                        <p><span className="font-medium">Credits:</span> {course.credits}</p>
                        {course.schedule && course.schedule.length > 0 && (
                          <p>
                            <span className="font-medium">Schedule:</span>{' '}
                            {course.schedule.map(s => `${s.day} ${s.time}`).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        {course.isEnrolled ? (
                          <button
                            onClick={() => navigate(`/course/${course.id}`)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            View Course
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewDetails(course)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">My Schedule</h2>
            </div>
            {renderSchedule()}
          </div>
        );

      case 'notifications':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <BellIcon className="w-5 h-5 mr-2 text-blue-500" />
                Recent Notifications
              </h2>
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} 
                       className="group p-4 border-l-4 border-blue-500 bg-white hover:bg-blue-50/50 
                                rounded-r-xl shadow-sm hover:shadow-md transition-all duration-200">
                    <p className="text-gray-800 font-medium group-hover:text-blue-700 transition-colors">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="text-sm font-medium text-blue-600">{notification.teacher}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Mark All as Read
                </button>
                <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Notification Settings
                </button>
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="space-y-6">
            {/* Performance Graph */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Academic Performance Trend</h2>
              <div className="h-80 relative">
                {/* Grade Range Indicators */}
                <div className="absolute left-0 top-0 h-full w-16 flex flex-col justify-between text-sm text-gray-500">
                  <span>100%</span>
                  <span className="text-green-500">70% - A</span>
                  <span className="text-blue-500">60% - B</span>
                  <span className="text-yellow-500">50% - C</span>
                  <span className="text-orange-500">40% - D</span>
                  <span className="text-red-500">0% - E</span>
                </div>
                
                {/* Graph Area */}
                <div className="ml-16 h-full relative">
                  {/* Grade Range Background */}
                  <div className="absolute inset-0 flex flex-col">
                    <div className="h-3/10 bg-green-50" /> {/* A range */}
                    <div className="h-1/10 bg-blue-50" />  {/* B range */}
                    <div className="h-1/10 bg-yellow-50" /> {/* C range */}
                    <div className="h-1/10 bg-orange-50" /> {/* D range */}
                    <div className="h-4/10 bg-red-50" />   {/* E range */}
                  </div>
                  
                  {/* Line Graph */}
                  <div className="absolute inset-0">
                    <svg className="w-full h-full">
                      <path
                        d={grades.map((grade, index) => {
                          const x = (index / (grades.length - 1)) * 100;
                          const y = 100 - grade.percentage;
                          return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#4F46E5"
                        strokeWidth="2"
                      />
                      {grades.map((grade, index) => (
                        <circle
                          key={index}
                          cx={`${(index / (grades.length - 1)) * 100}%`}
                          cy={`${100 - grade.percentage}%`}
                          r="4"
                          fill="#4F46E5"
                        />
                      ))}
                    </svg>
                  </div>
                  
                  {/* Semester Labels */}
                  <div className="absolute bottom-0 w-full flex justify-between text-sm text-gray-500">
                    {grades.map((grade, index) => (
                      <span key={index}>{grade.course}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Retakes Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                Unit Retakes
                <span className="ml-2 px-2 py-1 text-sm bg-red-100 text-red-600 rounded-full">
                  {grades.length} Total
                </span>
              </h2>
              
              <div className="space-y-4">
                {grades.map((grade, index) => (
                  <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{grade.course}</h3>
                        <p className="text-sm text-gray-600">
                          Original Attempt: {grade.originalSemester}
                        </p>
                        <p className="text-sm text-gray-600">
                          Retake: {grade.retakeSemester}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Original Grade: 
                          <span className="font-bold text-red-600 ml-1">
                            {grade.originalGrade}%
                          </span>
                        </p>
                        <p className="text-sm">
                          Improved Grade: 
                          <span className="font-bold text-green-600 ml-1">
                            {grade.improvedGrade}%
                          </span>
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {grade.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Financial Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Semester Fees */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <BanknotesIcon className="w-6 h-6 mr-2 text-blue-500" />
                  Current Semester Fees
                </h2>
                
                <div className="space-y-4">
                  {/* Semester Fee */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Semester Fee</span>
                      <span className="text-lg font-bold">KSH {financialStatus?.semesterFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Due by {financialStatus?.nextPaymentDeadline}</span>
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        {financialStatus?.tuitionStatus}
                      </span>
                    </div>
                  </div>

                  {/* Hostel Fee */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Hostel Fee (Optional)</span>
                      <span className="text-lg font-bold">KSH {financialStatus?.hostelFee?.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Due by {financialStatus?.hostelFee?.deadline}</span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                        {financialStatus?.hostelFee?.status}
                      </span>
                    </div>
                  </div>

                  {/* Retake Fees */}
                  {financialStatus?.retakesFee?.pendingUnits?.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-3">Pending Retake Fees</h3>
                      {financialStatus.retakesFee.pendingUnits.map(unit => (
                        <div key={unit.code} className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">{unit.code} - {unit.name}</span>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold">KSH {unit.amount.toLocaleString()}</span>
                            <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                              Pay Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment Actions */}
                  <div className="flex space-x-4">
                    <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Pay Semester Fee
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Pay Hostel Fee
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                <div className="space-y-3">
                  {financialStatus?.paymentHistory?.map(payment => (
                    <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.type}</p>
                        <p className="text-sm text-gray-600">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">KSH {payment.amount.toLocaleString()}</p>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Semester Fee</span>
                  <span className="font-medium">KSH {financialStatus?.semesterFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Hostel Fee</span>
                  <span className="font-medium">KSH {financialStatus?.hostelFee?.amount.toLocaleString()}</span>
                </div>
                {financialStatus?.retakesFee?.pendingUnits?.length > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Retake Fees</span>
                    <span className="font-medium">
                      KSH {(financialStatus.retakesFee.pendingUnits.reduce((acc, unit) => acc + unit.amount, 0)).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 font-bold text-lg">
                  <span>Total Due</span>
                  <span className="text-blue-600">
                    KSH {(
                      financialStatus?.semesterFee +
                      financialStatus?.hostelFee?.amount +
                      financialStatus.retakesFee.pendingUnits.reduce((acc, unit) => acc + unit.amount, 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Pay All Fees
              </button>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                  <DocumentIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Course Resources
                </h2>
                  {materialsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : materialsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">{materialsError}</p>
                      <button
                        onClick={() => fetchMaterials()}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : classMaterials.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No materials available for this course yet
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {classMaterials.map((material) => (
                        <div
                          key={material.id}
                          className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 group"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                              {material.material_type === 'file' ? (
                                <DocumentIcon className="h-5 w-5 text-blue-600" />
                              ) : (
                                <LinkIcon className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                                {material.title}
                              </h4>
                              {material.description && (
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                  {material.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center space-x-4">
                                {material.file_type && (
                                  <span className="text-xs text-gray-500 uppercase">
                                    {material.file_type}
                                  </span>
                                )}
                                {material.file_size && (
                                  <span className="text-xs text-gray-500">
                                    {(material.file_size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {material.material_type === 'file' ? (
                            <button
                              onClick={() => handleDownload(material.id)}
                              className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                              Download
                            </button>
                          ) : (
                            <a
                              href={material.file_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                            >
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                              Open Link
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Resource Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Resource Type</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>All Types</option>
                    <option>Documents</option>
                    <option>Videos</option>
                    <option>Links</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Most Recent</option>
                    <option>Name A-Z</option>
                    <option>Name Z-A</option>
                    <option>Size</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Date Added</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>All Time</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header with Edit Button */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                  <div className="space-x-4">
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setIsGuardianModalOpen(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Add Guardian
                    </button>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData?.first_name} {studentData?.last_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData?.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">School</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData?.school_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="mt-1 text-lg text-gray-900">{studentData?.department_name || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

            {/* Guardian Information */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Guardian Information</h3>
                  <button
                    onClick={() => setIsGuardianModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add New Guardian
                  </button>
                </div>

                {/* List of Registered Guardians */}
                <div className="space-y-4">
                  {guardians.map((guardian, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {guardian.firstName} {guardian.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{guardian.relationship}</p>
                          <p className="text-sm text-gray-600">{guardian.email}</p>
                          <p className="text-sm text-gray-600">{guardian.phoneNumber}</p>
                          <p className="text-sm text-gray-600">{guardian.address}</p>
                        </div>
                        <button
                          onClick={() => removeGuardian(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* profileData.achievements is not defined, so this section is commented out */}
                  {/* {profileData.achievements.map(achievement => ( */}
                  {/*   <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"> */}
                  {/*     <span className="text-2xl">{achievement.icon}</span> */}
                  {/*     <span className="font-medium text-blue-900">{achievement.title}</span> */}
                  {/*   </div> */}
                  {/* ))} */}
                </div>
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Academic Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current GPA</span>
                    <span className="font-bold text-blue-600">{grades.reduce((total, grade) => total + grade.percentage, 0) / grades.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Credits Completed</span>
                    <span className="font-bold text-green-600">{grades.reduce((total, grade) => total + grade.credits, 0)}</span>
                  </div>
                </div>
              </div>

              {/* Current Semester Status */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Current Semester Status</h3>
                <div className="space-y-4">
                  {/* profileData.currentSemester is not defined, so this section is commented out */}
                  {/* <div> */}
                  {/*   <span className="text-gray-600">Semester</span> */}
                  {/*   <p className="font-medium text-gray-900">{profileData.currentSemester.name}</p> */}
                  {/* </div> */}
                  {/* <div> */}
                  {/*   <span className="text-gray-600">Status</span> */}
                  {/*   <p className={`font-medium ${ */}
                  {/*     profileData.currentSemester.status === 'activated'  */}
                  {/*       ? 'text-green-600' */}
                  {/*       : profileData.currentSemester.status === 'pending' */}
                  {/*       ? 'text-yellow-600' */}
                  {/*       : 'text-red-600' */}
                  {/*   }`}> */}
                  {/*     {profileData.currentSemester.status.charAt(0).toUpperCase() + profileData.currentSemester.status.slice(1)} */}
                  {/*   </p> */}
                  {/* </div> */}
                  {/* <div> */}
                  {/*   <span className="text-gray-600">Next Payment Due</span> */}
                  {/*   <p className="font-medium text-gray-900">{profileData.currentSemester.nextPaymentDue}</p> */}
                  {/* </div> */}
                </div>
              </div>
            </div>
          </div>
        );

      case 'online-classes':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Online Classes</h2>
            
            {/* Upcoming Classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledClasses.map((class_) => (
                <div key={class_.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{class_.title}</h3>
                      <p className="text-gray-600">{class_.course}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      class_.status === 'upcoming' 
                        ? 'bg-blue-100 text-blue-800'
                        : class_.status === 'live'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {class_.status.charAt(0).toUpperCase() + class_.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>{class_.date}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{class_.time}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    {class_.status === 'live' ? (
                      <button className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Join Class
                      </button>
                    ) : class_.status === 'upcoming' ? (
                      <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        Set Reminder
                      </button>
                    ) : (
                      <button className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                        View Recording
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'discussions':
        return (
          <div className="space-y-6">
            {!selectedGroup ? (
              // Discussion Groups List
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Discussion Groups</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                      My Groups
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      All Groups
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discussionGroups.map((group) => (
                    <div 
                      key={group.id} 
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.course}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {group.courseCode}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Members:</span>
                          <span className="font-medium">{group.members}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Topics:</span>
                          <span className="font-medium">{group.topics.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Active:</span>
                          <span className="font-medium">{group.lastActive}</span>
                        </div>
                      </div>

                      {group.topics.some(topic => topic.unread > 0) && (
                        <div className="mt-4 flex justify-end">
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            {group.topics.reduce((acc, topic) => acc + topic.unread, 0)} new messages
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : !selectedTopic ? (
              // Topics List for Selected Group
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setSelectedGroup(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-2xl font-semibold">{selectedGroup.name}</h2>
                      <p className="text-gray-600">{selectedGroup.course} • {selectedGroup.members} members</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    New Topic
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="space-y-6">
                    {/* Sample messages - in a real app, these would come from your backend */}
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">JD</span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">John Doe</span>
                          <span className="text-gray-500 text-sm">2 hours ago</span>
                        </div>
                        <p className="mt-1 text-gray-800">{selectedTopic.lastMessage}</p>
                      </div>
                    </div>

                    {/* Reply box */}
                    <div className="mt-6 border-t pt-6">
                      <textarea
                        rows={4}
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Write your reply..."
                      />
                      <div className="mt-4 flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Post Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Individual Topic View
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-semibold">{selectedTopic.title}</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="space-y-6">
                    {/* Sample messages - in a real app, these would come from your backend */}
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">JD</span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">John Doe</span>
                          <span className="text-gray-500 text-sm">2 hours ago</span>
                        </div>
                        <p className="mt-1 text-gray-800">{selectedTopic.lastMessage}</p>
                      </div>
                    </div>

                    {/* Reply box */}
                    <div className="mt-6 border-t pt-6">
                      <textarea
                        rows={4}
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Write your reply..."
                      />
                      <div className="mt-4 flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Post Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center p-6">
            <p className="text-gray-500">Content for {activeMenu} coming soon...</p>
          </div>
        );
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    // If you use context or redux, also clear user state here
    setIsProfileDropdownOpen(false);
    navigate('/login');
  };

  // Add a handler for saving profile changes
  const handleProfileSave = async (updatedData: any) => {
    try {
      setStudentData(updatedData);
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Add placeholder removeGuardian and handleGuardianRegistration
  const removeGuardian = (index: number) => {
    setGuardians(prev => prev.filter((_, i) => i !== index));
  };
  const handleGuardianRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: add a dummy guardian
    setGuardians(prev => [
      ...prev,
      {
        id: prev.length + 1,
        firstName: 'John',
        lastName: 'Doe',
        relationship: 'Parent',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        address: '123 Main St',
      },
    ]);
    setIsGuardianModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left side - Menu button and logo */}
          <div className="flex items-center lg:w-64">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="lg:hidden ml-2">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          {/* Right side - Just student name and avatar (optional) */}
          <div className="flex items-center justify-end flex-1 space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-gray-500">Spring 2024</span>
              <span className="text-gray-300">|</span>
            </div>
            <div className="flex items-center border-l pl-4 ml-4">
              <div className="hidden sm:block text-right mr-3">
                <p className="text-sm font-medium text-gray-900">{studentData?.first_name} {studentData?.last_name}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {studentData?.first_name?.[0]}{studentData?.last_name?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute right-4 top-4 p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Student Portal</h2>
              <p className="text-sm text-gray-500">Spring 2024</p>
            </div>
          </div>
          <div className="h-0.5 bg-gray-100 w-full mb-6"></div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMenu(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center p-3 rounded-xl transition-all duration-200
                  ${activeMenu === item.id 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${activeMenu === item.id ? 'text-white' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 pt-16 min-h-screen ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'
      }`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Banner */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 rounded-2xl shadow-lg">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back, {studentData?.first_name}! 👋
              </h1>
              <p className="text-blue-100">
                Your learning journey continues. Keep up the excellent work!
              </p>
            </div>
          </div>

          {/* Render content based on active menu */}
          {renderContent()}
        </div>
      </main>
      {isProfileModalOpen && studentData && (
        <EditStudentProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSubmit={handleProfileSave}
          user={studentData}
        />
      )}
      {isGuardianModalOpen && (
        <AddGuardianModal
          isOpen={isGuardianModalOpen}
          onClose={() => setIsGuardianModalOpen(false)}
          studentId={user?.id || 0}
        />
      )}
      {isGuardianModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Parent/Guardian</h2>
            {/* Guardian Registration Form (reuse your form JSX here) */}
            <form onSubmit={handleGuardianRegistration} className="space-y-4">
              {/* ...form fields for guardian registration... */}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Register Guardian
              </button>
              <button
                type="button"
                className="ml-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={() => setIsGuardianModalOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
      {isCourseModalOpen && selectedCourse && (
        <CourseDetailsModal
          isOpen={isCourseModalOpen}
          onClose={() => {
            setIsCourseModalOpen(false);
            setSelectedCourse(null);
            setCourseContent([]);
            setDiscussionGroups([]);
          }}
          course={selectedCourse}
          content={courseContent}
          contentLoading={contentLoading}
          onEnroll={() => selectedCourse && handleEnroll(selectedCourse.id)}
          discussionGroups={discussionGroups}
          discussionLoading={discussionLoading}
        />
      )}
    </div>
  );
};

export default StudentDashboard;