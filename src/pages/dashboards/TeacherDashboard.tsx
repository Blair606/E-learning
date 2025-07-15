import { useState, useEffect, useRef } from 'react';
import {
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  DocumentCheckIcon,
  AcademicCapIcon,
  PlusIcon,
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon,
  VideoCameraIcon,
  ClockIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  DocumentIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import CreateAssignmentModal from '../../components/modals/CreateAssignmentModal';
import CreateDiscussionGroupModal from '../../components/modals/CreateDiscussionGroupModal';
import AddCourseContentModal from '../../components/modals/AddCourseContentModal';
import EditTeacherProfileModal from '../../components/modals/EditTeacherProfileModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../store/slices/authSlice';
import axios from 'axios';
import { Department } from '../../services/departmentService';
import { teacherService } from '../../services/teacherService';
import type { Assignment, Notification, CourseContent, Course } from '../../services/teacherService';
import type { StudentAnalytics } from '../../services/analyticsService';
import type { User } from '../../store/slices/authSlice';
import { createDiscussionGroups, fetchDiscussionGroups } from '../../store/slices/discussionSlice';
import ScheduleClassModal from '../../components/modals/ScheduleClassModal';
import UploadClassMaterialModal from '../../components/modals/UploadClassMaterialModal';
import { analyticsService, type AnalyticsData, type ClassAnalytics, type AssignmentAnalytics, type DiscussionAnalytics } from '../../services/analyticsService';
import AnalyticsDetailModal from '../../components/modals/AnalyticsDetailModal';

interface ClassData {
  id: number;
  year: number;
  className: string;
  totalStudents: number;
  averagePerformance: number;
  students: StudentAnalytics[];
}

interface NotificationFormData {
  title: string;
  message: string;
  classId: number;
  emailNotification: boolean;
}

interface ScheduledClass {
  id: number;
  title: string;
  course: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  meetingLink?: string;
  recording?: string;
}

// Remove ExtendedCourse type entirely and use Course everywhere

// Move NotificationModal interface outside
interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NotificationFormData) => void;
  classes: { id: number; className: string }[];
}

// Move NotificationModal component outside
const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  classes 
}) => {
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    classId: 0,
    emailNotification: true,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Send Class Notification</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
            setFormData({ title: '', message: '', classId: 0, emailNotification: true });
          }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Select Class</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: Number(e.target.value) })}
                required
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.className}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  checked={formData.emailNotification}
                  onChange={(e) => setFormData({ ...formData, emailNotification: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-600">Send email notification</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3">
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
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [teacherName, setTeacherName] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showIndividualStudent, setShowIndividualStudent] = useState(false);
  const [selectedClassOverview, setSelectedClassOverview] = useState<ClassData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);
  const [isScheduleClassModalOpen, setIsScheduleClassModalOpen] = useState(false);
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedClassForMaterial, setSelectedClassForMaterial] = useState<number | null>(null);
  const [classMaterials, setClassMaterials] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [selectedClassAnalytics, setSelectedClassAnalytics] = useState<{
    classAnalytics: ClassAnalytics;
    studentAnalytics: StudentAnalytics[];
    assignmentAnalytics: AssignmentAnalytics[];
    discussionAnalytics: DiscussionAnalytics[];
  } | null>(null);

  // Get discussions state from Redux
  const discussionsState = useSelector((state: RootState) => state.discussions);
  const { groups: reduxDiscussionGroups, loading: discussionsLoading, error: discussionsError } = discussionsState;

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost/E-learning/api/departments/index.php', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success && response.data.departments) {
          setDepartments(response.data.departments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await axios.get(`http://localhost/E-learning/api/teachers/get_teacher.php?id=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.status === 'success' && response.data.data) {
          const teacherData = response.data.data;
          setTeacherName(`${teacherData.first_name} ${teacherData.last_name}`);
          
          if (teacherData.department_id && departments.length > 0) {
            const dept = departments.find(d => d.id === teacherData.department_id);
            if (dept) {
              // setDepartment(dept.name); // This line is removed as per the edit hint
            } else {
              // setDepartment('No Department'); // This line is removed as per the edit hint
            }
          } else {
            // setDepartment('No Department'); // This line is removed as per the edit hint
          }
          
          dispatch(setUser({
            ...teacherData,
            firstName: teacherData.first_name,
            lastName: teacherData.last_name,
          }));
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        if (user?.firstName && user?.lastName) {
          setTeacherName(`${user.firstName} ${user.lastName}`);
          dispatch(setUser({
            ...user,
            firstName: user.firstName,
            lastName: user.lastName,
          }));
        }
      }
    };

    fetchTeacherData();
  }, [user?.id, dispatch, departments]);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedCourseId) {
        setAssignments([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `http://localhost/E-learning/api/teachers/get_teacher_assignments.php?course_id=${selectedCourseId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.success) {
          setAssignments(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch assignments');
        }
      } catch (error: any) {
        console.error('Error fetching assignments:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to fetch assignments. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [selectedCourseId]);

  // Fetch courses when component mounts
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost/E-learning/api/courses/get_courses.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success && response.data.courses) {
        setCourses(response.data.courses);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch courses and stats
        const coursesData = await teacherService.getCourses();
        setCourses(coursesData.courses || []);

        const analyticsData = await analyticsService.getTeacherAnalytics();
        setAnalyticsData(analyticsData);

        // Fetch notifications
        const notificationsData = await teacherService.getNotifications();
        setNotifications(notificationsData.notifications || []);

        // Fetch student analytics
        const transformedClasses: ClassData[] = [];
        (analyticsData.studentAnalytics || []).forEach((curr: any) => {
          let existingClass = transformedClasses.find(c => c.id === curr.class_id);
          if (existingClass) {
            existingClass.students.push(curr);
          } else {
            transformedClasses.push({
              id: curr.class_id,
              year: 1,
              className: curr.class_name,
              totalStudents: curr.total_assignments || 0,
              averagePerformance: curr.grade || 0,
              students: [curr]
            });
          }
        });
        setClasses(transformedClasses);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [analyticsData]);

  // Fetch real-time pending tasks (assignments) when assignments change
  useEffect(() => {
    // Filter assignments for those that are not completed
    setPendingTasks(assignments.filter(a => a.status !== 'Completed'));
  }, [assignments]);

  const GRADE_COLORS = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];

  const navItems = [
    { id: 'overview', icon: BookOpenIcon, label: 'Overview' },
    { id: 'discussions', icon: ChatBubbleLeftRightIcon, label: 'Discussions' },
    { id: 'assignments', icon: DocumentCheckIcon, label: 'Assignments' },
    { id: 'online-classes', icon: VideoCameraIcon, label: 'Online Classes' },
    { id: 'students', icon: UsersIcon, label: 'Students' },
    { id: 'analytics', icon: ChartBarIcon, label: 'Analytics' },
  ];

  const handleCreateAssignment = (data: Course | Assignment) => {
    if ('courseId' in data) {
      // This is an Assignment object
      const selectedCourse = courses.find(c => c.id === Number(data.courseId));
      if (selectedCourse) {
        setSelectedCourseId(selectedCourse.id);
      }
      const newAssignment: Assignment = {
        ...data,
        id: assignments.length + 1,
        status: 'Active' as const,
        submissions: 0,
        course: selectedCourse?.name || '',
        totalStudents: selectedCourse?.students || 0,
      };
      setAssignments([...assignments, newAssignment]);
    } else {
      // This is a Course object
      setSelectedCourseId(data.id);
      setIsAssignmentModalOpen(true);
    }
  };

  const handleCreateDiscussionGroup = async (groupData: { title: string; course: string; numberOfGroups: number; description?: string; dueDate: string }) => {
    try {
      const selectedCourse = courses.find(c => c.id.toString() === groupData.course);
      if (!selectedCourse) {
        throw new Error('Selected course not found');
      }

      const result = await dispatch(createDiscussionGroups({
        title: groupData.title,
        courseId: selectedCourse.id,
        description: groupData.description || '',
        dueDate: groupData.dueDate,
        numberOfGroups: groupData.numberOfGroups
      })).unwrap();

      if (result.status === 'success') {
        // Refresh the discussion groups list
        await dispatch(fetchDiscussionGroups(selectedCourse.id)).unwrap();
        setIsDiscussionModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create discussion groups:', error);
      // You might want to show an error message to the user here
    }
  };

  // Load discussion groups when a course is selected
  useEffect(() => {
    if (selectedCourseId) {
      dispatch(fetchDiscussionGroups(selectedCourseId));
    }
  }, [selectedCourseId, dispatch]);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedStudent = selectedClass?.students.find(s => s.id === selectedStudentId);

  const handleSendNotification = async (data: NotificationFormData) => {
    const newNotification: Notification = {
      id: notifications.length + 1,
      title: data.title,
      message: data.message,
      timestamp: new Date().toISOString(),
      isRead: false,
      classId: data.classId,
      className: classes.find(c => c.id === data.classId)?.className || null
    };

    setNotifications([newNotification, ...notifications]);
  };

  const handleAddContent = (course: Course) => {
    setSelectedCourse(course);
    setSelectedCourseId(course.id);
    setIsAddContentModalOpen(true);
  };

  const handleProfileUpdate = (updatedProfile: User) => {
    const userWithStatus: User = {
      ...updatedProfile,
      status: 'active' as const
    };
    dispatch(setUser(userWithStatus));
    if (updatedProfile.department_id) {
      // console.log('Profile updated, refreshing courses for department:', updatedProfile.department_id);
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
    dispatch(setUser(null));
    setIsProfileDropdownOpen(false);
    navigate('/login');
  };

  const handleEditAssignment = (assignment: Assignment) => {
    // TODO: Implement edit functionality
    // console.log('Edit assignment:', assignment);
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    try {
      const response = await axios.delete(`http://localhost/E-learning/api/assignments/index.php`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: { id: assignmentId }
      });
      
      if (response.data.success) {
        setAssignments(assignments.filter(a => a.id !== assignmentId));
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Failed to delete assignment');
    }
  };

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setAssignments([]); // Clear existing assignments
    setError(null); // Clear any existing errors
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'discussions':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Discussion Groups</h2>
              <button
                onClick={() => setIsDiscussionModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Group
              </button>
            </div>
            {discussionsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : discussionsError ? (
              <div className="text-red-500 text-center p-4">{discussionsError}</div>
            ) : reduxDiscussionGroups?.length === 0 ? (
              <div className="text-gray-500 text-center p-4">No discussion groups found.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reduxDiscussionGroups?.map((group) => (
                  <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg">{group.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {group.courseName}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Members:</span>
                        <span className="font-medium">{group.memberCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Topics:</span>
                        <span className="font-medium">{group.topicCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created By:</span>
                        <span className="font-medium">{group.createdBy}</span>
                      </div>
                      {group.dueDate && (
                        <div className="flex justify-between">
                          <span>Due Date:</span>
                          <span className="font-medium">
                            {new Date(group.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                        View Discussions
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
                        Manage Members
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'assignments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Assignments</h2>
              <div className="flex items-center gap-4">
                <select
                  value={selectedCourseId || ''}
                  onChange={(e) => handleCourseSelect(Number(e.target.value))}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                >
                  <option value="">Select a Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsAssignmentModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={!selectedCourseId}
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Assignment
                </button>
              </div>
            </div>
            {!selectedCourseId ? (
              <div className="text-center text-gray-500 p-8">
                Please select a course to view assignments
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">{error}</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assignment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submissions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            No assignments found for this course
                          </td>
                        </tr>
                      ) : (
                        assignments.map((assignment) => (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{assignment.title}</div>
                              <div className="text-sm text-gray-500">{assignment.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {assignment.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                assignment.status === 'Active' 
                                  ? 'bg-green-100 text-green-800'
                                  : assignment.status === 'Completed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {assignment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.submissions} / {assignment.totalStudents}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleEditAssignment(assignment)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'online-classes':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Online Classes</h2>
              <button
                onClick={() => setIsScheduleClassModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Schedule Class
              </button>
            </div>

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

                  <div className="mt-4 flex flex-col space-y-2">
                    {class_.status === 'upcoming' ? (
                      <>
                        <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                          Start Class
                        </button>
                        <button className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">
                          Cancel
                        </button>
                      </>
                    ) : class_.status === 'live' ? (
                      <button className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Join Class
                      </button>
                    ) : (
                      <>
                        <button className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                          View Recording
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedClassForMaterial(class_.id);
                            setIsMaterialModalOpen(true);
                            fetchClassMaterials(class_.id);
                          }}
                          className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          Manage Materials
                        </button>
                      </>
                    )}
                  </div>

                  {class_.id === selectedClassForMaterial && classMaterials.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Class Materials</h4>
                      <div className="space-y-2">
                        {classMaterials.map((material) => (
                          <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              {material.material_type === 'file' ? (
                                <DocumentIcon className="w-4 h-4 text-gray-500 mr-2" />
                              ) : (
                                <LinkIcon className="w-4 h-4 text-gray-500 mr-2" />
                              )}
                              <span className="text-sm">{material.title}</span>
                            </div>
                            <a
                              href={material.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {material.material_type === 'file' ? 'Download' : 'Open'}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <ScheduleClassModal
              isOpen={isScheduleClassModalOpen}
              onClose={() => setIsScheduleClassModalOpen(false)}
              courses={courses}
              onClassScheduled={() => {
                fetchScheduledClasses();
              }}
            />

            <UploadClassMaterialModal
              isOpen={isMaterialModalOpen}
              onClose={() => {
                setIsMaterialModalOpen(false);
                setSelectedClassForMaterial(null);
              }}
              classId={selectedClassForMaterial || 0}
              onMaterialUploaded={() => {
                if (selectedClassForMaterial) {
                  fetchClassMaterials(selectedClassForMaterial);
                }
              }}
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Analytics Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <UsersIcon className="w-12 h-12 text-blue-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                    <p className="text-2xl font-semibold text-gray-800">
                      {analyticsData?.classAnalytics.reduce((sum, c) => sum + c.total_students, 0) || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <AcademicCapIcon className="w-12 h-12 text-green-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Average Grade</h3>
                    <p className="text-2xl font-semibold text-gray-800">
                      {analyticsData?.classAnalytics.reduce((sum, c) => sum + c.average_grade, 0) / 
                        (analyticsData?.classAnalytics.length || 1) || 0}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <CalendarIcon className="w-12 h-12 text-purple-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Average Attendance</h3>
                    <p className="text-2xl font-semibold text-gray-800">
                      {analyticsData?.classAnalytics.reduce((sum, c) => sum + c.average_attendance, 0) / 
                        (analyticsData?.classAnalytics.length || 1) || 0}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-yellow-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Discussions</h3>
                    <p className="text-2xl font-semibold text-gray-800">
                      {analyticsData?.discussionAnalytics.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Performance Overview */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Class Performance Overview</h3>
                <BarChart
                  width={500}
                  height={300}
                  data={analyticsData?.classAnalytics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average_grade" name="Average Grade" fill="#8884d8" />
                  <Bar dataKey="average_attendance" name="Attendance" fill="#82ca9d" />
                </BarChart>
              </div>

              {/* Assignment Completion Rate */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Assignment Completion Rate</h3>
                <LineChart
                  width={500}
                  height={300}
                  data={analyticsData?.assignmentAnalytics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submitted_count" name="Submissions" stroke="#8884d8" />
                  <Line type="monotone" dataKey="average_grade" name="Average Grade" stroke="#82ca9d" />
                </LineChart>
              </div>
            </div>

            {/* Class List */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Class List</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyticsData?.classAnalytics.map((classData) => (
                  <div
                    key={classData.class_id}
                    className="border p-4 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => handleClassAnalyticsClick(classData.class_id)}
                  >
                    <h4 className="font-medium text-lg mb-2">{classData.class_name}</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Students: {classData.total_students}</p>
                      <p>Average Grade: {classData.average_grade.toFixed(1)}%</p>
                      <p>Attendance: {classData.average_attendance.toFixed(1)}%</p>
                      <p>Progress: {classData.average_progress.toFixed(1)}%</p>
                    </div>
                    <button className="mt-4 w-full px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Detail Modal */}
            {selectedClassAnalytics && (
              <AnalyticsDetailModal
                isOpen={isAnalyticsModalOpen}
                onClose={() => {
                  setIsAnalyticsModalOpen(false);
                  setSelectedClassAnalytics(null);
                }}
                classAnalytics={selectedClassAnalytics.classAnalytics}
                studentAnalytics={selectedClassAnalytics.studentAnalytics}
                assignmentAnalytics={selectedClassAnalytics.assignmentAnalytics}
                discussionAnalytics={selectedClassAnalytics.discussionAnalytics}
              />
            )}
          </div>
        );

      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <UsersIcon className="w-12 h-12 text-blue-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                    <p className="text-2xl font-semibold text-gray-800">{analyticsData?.classAnalytics?.reduce((sum, c) => sum + (c.total_students || 0), 0) || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <CalendarIcon className="w-12 h-12 text-green-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Attendance</h3>
                    <p className="text-2xl font-semibold text-gray-800">{analyticsData?.classAnalytics.reduce((sum, c) => sum + c.average_attendance, 0) / (analyticsData?.classAnalytics.length || 1) || 0}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <AcademicCapIcon className="w-12 h-12 text-purple-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Grade</h3>
                    <p className="text-2xl font-semibold text-gray-800">{analyticsData?.classAnalytics.reduce((sum, c) => sum + c.average_grade, 0) / (analyticsData?.classAnalytics.length || 1) || 0}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-yellow-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Discussions</h3>
                    <p className="text-2xl font-semibold text-gray-800">{analyticsData?.discussionAnalytics.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">My Courses</h2>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center p-4">{error}</div>
                ) : courses.length === 0 ? (
                  <div className="text-gray-500 text-center p-4">No courses found.</div>
                ) : (
                  <div className="w-full flex justify-center">
                    <div className="grid grid-cols-1 gap-8 w-full">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="bg-white rounded-2xl shadow-lg px-10 py-8 border border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between min-h-[160px] w-full max-w-4xl mx-auto mb-2"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h3>
                            <div className="mb-2">
                              <span className="block text-base text-gray-800 font-medium">Total Students: <span className="font-semibold">{course.totalStudents}</span></span>
                              <span className="block text-base text-gray-800 font-medium">Average Performance: <span className="font-semibold">{course.progress ?? 0}%</span></span>
                            </div>
                            <div className="text-xs text-gray-400 mb-1 font-mono tracking-wide">Code: {course.code}</div>
                            <div className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-4 md:mt-0 md:ml-8">
                            <button
                              onClick={() => handleAddContent(course as Course)}
                              className="px-4 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-sm transition whitespace-nowrap"
                            >
                              Add Content
                            </button>
                            <button
                              onClick={() => handleCreateAssignment(course as Assignment)}
                              className="px-4 py-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 font-medium text-sm transition whitespace-nowrap"
                            >
                              Create Assignment
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
                <div className="space-y-4">
                  {pendingTasks.length === 0 ? (
                    <div className="text-gray-500 text-center p-4">No pending tasks.</div>
                  ) : (
                    pendingTasks.map(task => (
                      <div key={task.id} className="border p-4 rounded-lg hover:border-blue-500 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-sm font-medium text-blue-600">{task.type}</span>
                            <h3 className="font-medium mt-1">{task.title}</h3>
                            <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {task.totalStudents - task.submissions} items
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {courses.map((classData) => (
                <div 
                  key={classData.id}
                  className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
                  onClick={() => setSelectedClassOverview({
                    id: classData.id,
                    year: 1,
                    className: classData.name,
                    totalStudents: classData.students || 0,
                    averagePerformance: classData.progress || 0,
                    students: []
                  })}
                >
                  <h3 className="text-xl font-bold mb-4">{classData.name}</h3>
                  <p>Total Students: {classData.students || 0}</p>
                  <p>Average Performance: {classData.progress || 0}%</p>
                </div>
              ))}
            </div>

            {selectedClassOverview && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{selectedClassOverview.className} Analytics</h2>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => setShowIndividualStudent(!showIndividualStudent)}
                  >
                    {showIndividualStudent ? 'Show Class Overview' : 'Show Individual Students'}
                  </button>
                </div>

                {!showIndividualStudent ? (
                  <BarChart
                    width={1000}
                    height={400}
                    data={[selectedClassOverview]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averagePerformance" fill="#8884d8" name="Class Average Performance" />
                  </BarChart>
                ) : (
                  <BarChart
                    width={1000}
                    height={400}
                    data={selectedClassOverview.students}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="performance" fill="#82ca9d" name="Student Performance" />
                  </BarChart>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <UsersIcon className="w-12 h-12 text-blue-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                    <p className="text-2xl font-semibold text-gray-800">{analyticsData?.classAnalytics.reduce((sum, c) => sum + c.total_students, 0) || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <CalendarIcon className="w-12 h-12 text-green-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Attendance</h3>
                    <p className="text-2xl font-semibold text-gray-800">{analyticsData?.classAnalytics.reduce((sum, c) => sum + c.average_attendance, 0) / (analyticsData?.classAnalytics.length || 1) || 0}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <AcademicCapIcon className="w-12 h-12 text-purple-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Grade</h3>
                    <p className="text-2xl font-semibold text-gray-800">{analyticsData?.classAnalytics.reduce((sum, c) => sum + c.average_grade, 0) / (analyticsData?.classAnalytics.length || 1) || 0}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-yellow-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Discussions</h3>
                    <p className="text-2xl font-semibold text-gray-800">{analyticsData?.discussionAnalytics.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">My Courses</h2>
                <div className="space-y-4">
                  {courses.map(course => (
                    <div key={course.id} className="border p-4 rounded-lg hover:border-blue-500 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-lg">{course.name}</h3>
                        <span className="text-sm text-gray-500">{course.totalStudents || 0} Students</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Next Class: {course.nextClass}</span>
                        <span>Progress: {course.progress || 0}%</span>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
                <div className="space-y-4">
                  {pendingTasks.length === 0 ? (
                    <div className="text-gray-500 text-center p-4">No pending tasks.</div>
                  ) : (
                    pendingTasks.map(task => (
                      <div key={task.id} className="border p-4 rounded-lg hover:border-blue-500 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-sm font-medium text-blue-600">{task.type}</span>
                            <h3 className="font-medium mt-1">{task.title}</h3>
                            <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {task.totalStudents - task.submissions} items
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {courses.map((classData) => (
                <div 
                  key={classData.id}
                  className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
                  onClick={() => setSelectedClassOverview({
                    id: classData.id,
                    year: 1,
                    className: classData.name,
                    totalStudents: classData.students || 0,
                    averagePerformance: classData.progress || 0,
                    students: []
                  })}
                >
                  <h3 className="text-xl font-bold mb-4">{classData.name}</h3>
                  <p>Total Students: {classData.students || 0}</p>
                  <p>Average Performance: {classData.progress || 0}%</p>
                </div>
              ))}
            </div>

            {selectedClassOverview && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{selectedClassOverview.className} Analytics</h2>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => setShowIndividualStudent(!showIndividualStudent)}
                  >
                    {showIndividualStudent ? 'Show Class Overview' : 'Show Individual Students'}
                  </button>
                </div>

                {!showIndividualStudent ? (
                  <BarChart
                    width={1000}
                    height={400}
                    data={[selectedClassOverview]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averagePerformance" fill="#8884d8" name="Class Average Performance" />
                  </BarChart>
                ) : (
                  <BarChart
                    width={1000}
                    height={400}
                    data={selectedClassOverview.students}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="performance" fill="#82ca9d" name="Student Performance" />
                  </BarChart>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  // Move fetchScheduledClasses inside the component
  const fetchScheduledClasses = async () => {
    try {
      const response = await axios.get('http://localhost/E-learning/api/teachers/online_classes.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setScheduledClasses(response.data.classes);
      }
    } catch (error) {
      console.error('Error fetching scheduled classes:', error);
    }
  };

  // Move useEffect inside the component
  useEffect(() => {
    fetchScheduledClasses();
  }, []);

  // Add function to fetch materials
  const fetchClassMaterials = async (classId: number) => {
    try {
      const response = await axios.get(
        `http://localhost/E-learning/api/teachers/class_materials.php?class_id=${classId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setClassMaterials(response.data.materials);
      }
    } catch (error) {
      console.error('Error fetching class materials:', error);
    }
  };

  // Add this useEffect to fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.getTeacherAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  // Add this function to handle class selection for detailed analytics
  const handleClassAnalyticsClick = async (classId: number) => {
    try {
      const classAnalytics = await analyticsService.getClassAnalytics(classId);
      const studentAnalytics = await analyticsService.getStudentAnalytics(classId);
      
      setSelectedClassAnalytics({
        classAnalytics,
        studentAnalytics,
        assignmentAnalytics: analyticsData?.assignmentAnalytics.filter(a => a.class_id === classId) || [],
        discussionAnalytics: analyticsData?.discussionAnalytics.filter(d => d.class_id === classId) || []
      });
      
      setIsAnalyticsModalOpen(true);
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="flex items-center justify-between px-4 h-16">
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

          <div className="flex items-center justify-end flex-1 space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-gray-500">Spring 2024</span>
              <span className="text-gray-300">|</span>
            </div>
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Send Message</span>
            </button>
            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen((open) => !open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <BellIcon className="w-5 h-5 text-gray-500" />
                <UserCircleIcon className="w-7 h-7 text-gray-600" />
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-gray-800 leading-tight">{teacherName || ''}</div>
                  <div className="text-xs text-gray-500">{user?.role || 'teacher'}</div>
                </div>
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border">
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 gap-2"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    Profile
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 gap-2">
                    <Cog6ToothIcon className="w-5 h-5" />
                    Settings
                  </button>
                  <div className="border-t my-1" />
                  <button
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 gap-2"
                    onClick={handleLogout}
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

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
              <h2 className="text-xl font-bold text-gray-800">Teacher Portal</h2>
              <p className="text-sm text-gray-500">Spring 2024</p>
            </div>
          </div>
          <div className="h-0.5 bg-gray-100 w-full mb-6"></div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center p-3 rounded-xl transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-white' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <main className={`transition-all duration-300 pt-16 min-h-screen ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'
      }`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 rounded-2xl shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {teacherName || ''}! 👋</h1>
                  <p className="text-blue-100">You have {courses.length} classes scheduled for today.</p>
                </div>
                <button
                  onClick={() => setIsNotificationModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 w-full sm:w-auto justify-center"
                >
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  Send Class Message
                </button>
              </div>
            </div>
          </div>
          
          {renderContent()}
        </div>
      </main>

      <CreateAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        courses={courses}
        onAssignmentCreated={handleCreateAssignment}
      />

      <CreateDiscussionGroupModal
        isOpen={isDiscussionModalOpen}
        onClose={() => setIsDiscussionModalOpen(false)}
        courses={courses}
        onSubmit={handleCreateDiscussionGroup}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onSubmit={handleSendNotification}
        classes={classes}
      />

      <ScheduleClassModal
        isOpen={isScheduleClassModalOpen}
        onClose={() => setIsScheduleClassModalOpen(false)}
        courses={courses}
        onClassScheduled={() => {
          fetchScheduledClasses();
        }}
      />

      <AddCourseContentModal
        isOpen={isAddContentModalOpen}
        onClose={() => setIsAddContentModalOpen(false)}
        onSubmit={handleAddContent}
        courseId={selectedCourse?.id || 0}
      />

      <EditTeacherProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSubmit={handleProfileUpdate}
        user={user}
      />

      {user?.role === 'admin' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => navigate('/dashboard/admin')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg"
          >
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            Access Admin Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;