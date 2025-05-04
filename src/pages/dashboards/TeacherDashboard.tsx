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
import type { Assignment, Notification, StudentAnalytics, CourseContent } from '../../services/teacherService';
import type { User } from '../../store/slices/authSlice';
import { courseService, type Course } from '../../services/courseService';
import { createDiscussionGroups, fetchDiscussionGroups } from '../../store/slices/discussionSlice';

interface ClassData {
  id: number;
  year: number;
  className: string;
  totalStudents: number;
  averagePerformance: number;
  students: StudentAnalytics[];
}

interface DiscussionGroupData {
  title: string;
  course: string;
  numberOfGroups: number;
  description?: string;
  dueDate: string;
}

interface DiscussionGroup {
  id: number;
  name: string;
  course: string;
  members: number;
  lastActive: string;
  topics: number;
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

interface UpcomingTask {
  id: number;
  type: string;
  task: string;
  deadline: string;
  count: number;
}

interface ExtendedCourse extends Course {
    students?: number;
    nextClass?: string;
    progress?: number;
    content?: CourseContent[];
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [teacherName, setTeacherName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [studentStats, setStudentStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    averageGrade: '0',
    activeDiscussions: 0
  });
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showIndividualStudent, setShowIndividualStudent] = useState(false);
  const [selectedClassOverview, setSelectedClassOverview] = useState<ClassData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);
  const [isScheduleClassModalOpen, setIsScheduleClassModalOpen] = useState(false);
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);
  const [discussionGroups, setDiscussionGroups] = useState<DiscussionGroup[]>([]);
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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
              setDepartment(dept.name);
            } else {
              setDepartment('No Department');
            }
          } else {
            setDepartment('No Department');
          }
          
          console.log('Fetched teacherData:', teacherData);
          dispatch(setUser({
            ...teacherData,
            firstName: teacherData.first_name,
            lastName: teacherData.last_name,
          }));
          console.log('Redux user after setUser:', {
            ...teacherData,
            firstName: teacherData.first_name,
            lastName: teacherData.last_name,
          });
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        if (user?.first_name && user?.last_name) {
          setTeacherName(`${user.first_name} ${user.last_name}`);
          setDepartment(user.department_id ? 'No Department' : 'No Department');
          dispatch(setUser({
            ...user,
            firstName: user.first_name,
            lastName: user.last_name,
          }));
        }
      }
    };

    fetchTeacherData();
  }, [user?.id, dispatch, departments]);

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

        setStudentStats({
          totalStudents: coursesData.stats?.totalStudents || 0,
    averageAttendance: 92,
          averageGrade: coursesData.stats?.averageGrade.toFixed(1) || '0',
          activeDiscussions: coursesData.stats?.activeAssignments || 0
        });

        // Fetch assignments
        const assignmentsData = await teacherService.getAssignments();
        setAssignments(assignmentsData.assignments || []);

        // Fetch notifications
        const notificationsData = await teacherService.getNotifications();
        setNotifications(notificationsData.notifications || []);

        // Fetch student analytics
        const analyticsData = await teacherService.getStudentAnalytics();
        const transformedClasses = (analyticsData.analytics || []).reduce((acc: ClassData[], curr: StudentAnalytics) => {
          const existingClass = acc.find(c => c.id === curr.courseId);
          if (existingClass) {
            existingClass.students.push(curr);
          } else {
            acc.push({
              id: curr.courseId,
              year: 1,
              className: curr.courseName,
              totalStudents: 0,
              averagePerformance: curr.averageGrade,
              students: [curr]
            });
          }
          return acc;
        }, []);
        setClasses(transformedClasses);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch real-time pending tasks (assignments) when assignments change
  useEffect(() => {
    // Filter assignments for those that are not completed
    setPendingTasks(assignments.filter(a => a.status !== 'Completed'));
  }, [assignments]);

  console.log('TeacherDashboard user:', user);
  console.log('User role:', user?.role);
  console.log('Is admin?', user?.role === 'admin');

  const GRADE_COLORS = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];

  const navItems = [
    { id: 'overview', icon: BookOpenIcon, label: 'Overview' },
    { id: 'discussions', icon: ChatBubbleLeftRightIcon, label: 'Discussions' },
    { id: 'assignments', icon: DocumentCheckIcon, label: 'Assignments' },
    { id: 'online-classes', icon: VideoCameraIcon, label: 'Online Classes' },
    { id: 'students', icon: UsersIcon, label: 'Students' },
    { id: 'analytics', icon: ChartBarIcon, label: 'Analytics' },
  ];

  const handleCreateAssignment = (assignmentData: Assignment) => {
    const selectedCourse = courses.find(c => c.id === Number(assignmentData.courseId));
    if (selectedCourse) {
      setSelectedCourseId(selectedCourse.id);
    }
    const newAssignment: Assignment = {
      ...assignmentData,
      id: assignments.length + 1,
      status: 'Active' as const,
      submissions: 0,
      course: selectedCourse?.name || '',
      totalStudents: selectedCourse?.students || 0,
    };
    setAssignments([...assignments, newAssignment]);
  };

  const handleCreateDiscussionGroup = async (groupData: DiscussionGroupData) => {
    try {
      const selectedCourse = courses.find(c => c.id.toString() === groupData.course);
      if (!selectedCourse) {
        throw new Error('Selected course not found');
      }

      await dispatch(createDiscussionGroups({
        title: groupData.title,
        courseId: selectedCourse.id,
        description: groupData.description || '',
        dueDate: groupData.dueDate,
        numberOfGroups: groupData.numberOfGroups
      })).unwrap();

      // Refresh the discussion groups list
      await dispatch(fetchDiscussionGroups(selectedCourse.id)).unwrap();
      
      setIsDiscussionModalOpen(false);
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

  const handleAddContent = (course: ExtendedCourse) => {
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
      console.log('Profile updated, refreshing courses for department:', updatedProfile.department_id);
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discussionGroups.map((group) => (
                <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {group.course}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Members:</span>
                      <span className="font-medium">{group.members}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Topics:</span>
                      <span className="font-medium">{group.topics}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Active:</span>
                      <span className="font-medium">{group.lastActive}</span>
                    </div>
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
          </div>
        );

      case 'assignments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Assignments</h2>
              <button
                onClick={() => setIsAssignmentModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Assignment
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
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
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{assignment.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.dueDate}
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
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.submissions} / {assignment.totalStudents}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

                  <div className="mt-4 flex space-x-2">
                    {class_.status === 'upcoming' ? (
                      <>
                        <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                          Start Class
                        </button>
                        <button className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">
                          Cancel
                        </button>
                      </>
                    ) : class_.status === 'live' ? (
                      <button className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Join Class
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

      case 'analytics':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Analytics Dashboard</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex space-x-4 mb-6">
                <select
                  className="form-select rounded-md border-gray-300"
                  value={selectedClassId || ''}
                  onChange={(e) => {
                    setSelectedClassId(Number(e.target.value));
                    setSelectedStudentId(null);
                  }}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className}
                    </option>
                  ))}
                </select>

                {selectedClassId && (
                  <select
                    className="form-select rounded-md border-gray-300"
                    value={selectedStudentId || ''}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">All Students</option>
                    {selectedClass?.students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedClassId && !selectedStudentId && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Class Performance</h3>
                      <BarChart
                        width={500}
                        height={300}
                        data={selectedClass?.students.map(student => ({
                          name: student.name,
                          average: student.grades.reduce((acc, curr) => acc + curr.grade, 0) / student.grades.length,
                          attendance: student.grades.reduce((acc, curr) => acc + curr.attendance, 0) / student.grades.length
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="average" name="Average Grade" fill="#8884d8" />
                        <Bar dataKey="attendance" name="Attendance %" fill="#82ca9d" />
                      </BarChart>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Unit Performance Distribution</h3>
                      <PieChart width={400} height={300}>
                        <Pie
                          data={[
                            { name: 'A (90-100)', value: selectedClass?.students.filter(s => 
                              s.grades.some(g => g.grade >= 90)).length || 0 },
                            { name: 'B (80-89)', value: selectedClass?.students.filter(s => 
                              s.grades.some(g => g.grade >= 80 && g.grade < 90)).length || 0 },
                            { name: 'C (70-79)', value: selectedClass?.students.filter(s => 
                              s.grades.some(g => g.grade >= 70 && g.grade < 80)).length || 0 },
                            { name: 'D (60-69)', value: selectedClass?.students.filter(s => 
                              s.grades.some(g => g.grade >= 60 && g.grade < 70)).length || 0 },
                            { name: 'F (<60)', value: selectedClass?.students.filter(s => 
                              s.grades.some(g => g.grade < 60)).length || 0 },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx={200}
                          cy={150}
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                        >
                          {GRADE_COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </div>
                  </div>
                </>
              )}

              {selectedStudentId && (
                <>
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">
                      Student Analysis: {selectedStudent?.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="text-lg font-semibold mb-4">Performance by Unit</h4>
                        <BarChart
                          width={500}
                          height={300}
                          data={selectedStudent?.grades}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="unit" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="grade" name="Grade" fill="#8884d8" />
                          <Bar dataKey="attendance" name="Attendance" fill="#82ca9d" />
                        </BarChart>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="text-lg font-semibold mb-4">Submission Analysis</h4>
                        <LineChart
                          width={500}
                          height={300}
                          data={selectedStudent?.grades}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="unit" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="submissions" name="Submissions" stroke="#8884d8" />
                        </LineChart>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          label: 'Average Grade',
                          value: `${(selectedStudent?.grades.reduce((acc, curr) => acc + curr.grade, 0) || 0 / 
                            (selectedStudent?.grades.length || 1)).toFixed(1)}%`
                        },
                        {
                          label: 'Average Attendance',
                          value: `${(selectedStudent?.grades.reduce((acc, curr) => acc + curr.attendance, 0) || 0 / 
                            (selectedStudent?.grades.length || 1)).toFixed(1)}%`
                        },
                        {
                          label: 'Total Submissions',
                          value: selectedStudent?.grades.reduce((acc, curr) => acc + curr.submissions, 0) || 0
                        }
                      ].map((metric, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                          <h4 className="text-sm text-gray-500">{metric.label}</h4>
                          <div className="text-2xl font-bold mt-2">{metric.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
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
                    <p className="text-2xl font-semibold text-gray-800">{studentStats.totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <CalendarIcon className="w-12 h-12 text-green-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Attendance</h3>
                    <p className="text-2xl font-semibold text-gray-800">{studentStats.averageAttendance}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <AcademicCapIcon className="w-12 h-12 text-purple-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Grade</h3>
                    <p className="text-2xl font-semibold text-gray-800">{studentStats.averageGrade}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-yellow-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Discussions</h3>
                    <p className="text-2xl font-semibold text-gray-800">{studentStats.activeDiscussions}</p>
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
                              onClick={() => handleAddContent(course as ExtendedCourse)}
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
                    totalStudents: classData.students,
                    averagePerformance: classData.progress,
                    students: []
                  })}
                >
                  <h3 className="text-xl font-bold mb-4">{classData.name}</h3>
                  <p>Total Students: {classData.students}</p>
                  <p>Average Performance: {classData.progress}%</p>
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
                    <p className="text-2xl font-semibold text-gray-800">{studentStats.totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <CalendarIcon className="w-12 h-12 text-green-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Attendance</h3>
                    <p className="text-2xl font-semibold text-gray-800">{studentStats.averageAttendance}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <AcademicCapIcon className="w-12 h-12 text-purple-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Grade</h3>
                    <p className="text-2xl font-semibold text-gray-800">{studentStats.averageGrade}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-yellow-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Discussions</h3>
                    <p className="text-2xl font-semibold text-gray-800">{studentStats.activeDiscussions}</p>
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
                        <span className="text-sm text-gray-500">{course.totalStudents} Students</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Next Class: {course.nextClass}</span>
                        <span>Progress: {course.progress}%</span>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
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
                    totalStudents: classData.students,
                    averagePerformance: classData.progress,
                    students: []
                  })}
                >
                  <h3 className="text-xl font-bold mb-4">{classData.name}</h3>
                  <p>Total Students: {classData.students}</p>
                  <p>Average Performance: {classData.progress}%</p>
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
                  <div className="font-medium text-gray-800 leading-tight">{teacherName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Teacher')}</div>
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {teacherName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Teacher')}! 👋</h1>
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
        onSubmit={(data) => {
          const newClass: ScheduledClass = {
            id: scheduledClasses.length + 1,
            ...data,
            status: 'upcoming',
          };
          setScheduledClasses([...scheduledClasses, newClass]);
          setIsScheduleClassModalOpen(false);
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

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  classes 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: NotificationFormData) => void;
  classes: { id: number; className: string }[];
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

const ScheduleClassModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  courses 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: Omit<ScheduledClass, 'id' | 'status'>) => void;
  courses: { id: number; name: string; }[];
}) => {
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    date: '',
    time: '',
    meetingLink: '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Schedule Online Class</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
          setFormData({ title: '', course: '', date: '', time: '', meetingLink: '' });
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting Link (Optional)</label>
              <input
                type="url"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
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
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDashboard;