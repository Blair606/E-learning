import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  UserPlusIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import DashboardHeader from "../../components/DashboardHeader";
import CreateCourseModal, {
  CourseFormData,
} from "../../components/modals/CreateCourseModal";
import { User } from "../../types/user";

import "react-datepicker/dist/react-datepicker.css";

import { userService } from '../../services/userService';
import UserManagementModal from "../../components/modals/UserManagementModal";
import Finance from "./admincomponents/Finance";
import Departments from "./admincomponents/Departments";
import CreateSchoolModal, { SchoolFormData } from "../../components/modals/CreateSchoolModal";
import { schoolService } from '../../services/schoolService';
import { courseService } from '../../services/courseService';
import { toast } from "react-hot-toast";
import axios from "axios";

// Remove local interface definitions for School, Department, and Course
// Use types from services
import { School } from '../../services/schoolService';
import { Course } from '../../services/courseService';

const AdminDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Replace hardcoded systemStats with real-time data
  const [systemStats, setSystemStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeCourses: 0,
    departments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });

  const fetchSystemStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost/E-learning/api/admin/stats.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setSystemStats(response.data.stats);
      } else {
        throw new Error(response.data.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch system stats');
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [users, setUsers] = useState<User[]>([]); // Initialize as an empty array

  const [userModalType, setUserModalType] = useState<'student' | 'teacher'>('student');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalMode, setUserModalMode] = useState<'create' | 'update' | 'delete'>('create');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);

  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState("");
  const [currentCoursePage, setCurrentCoursePage] = useState(1);
  const coursesPerPage = 10;

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Add state for schools
  const [schools, setSchools] = useState<School[]>([]);

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost/E-learning/api/courses/index.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Accept both array and object with data property
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.courses || response.data.data || [];
      if (Array.isArray(data)) {
        const transformedCourses: Course[] = data.map((course: Record<string, unknown>) => ({
          id: Number(course.id),
          name: course.name as string || (course.title as string) || '',
          code: course.code as string,
          description: course.description as string,
          credits: Number(course.credits) || 0,
          status: (course.status as string) || 'active',
          schedule: course.schedule || [],
          prerequisites: course.prerequisites || [],
          department: course.department_name as string || course.department as string || '',
          school: course.school_name as string || course.school as string || '',
          instructor: course.instructor_name as string || course.instructor as string || '',
          instructorId: Number(course.instructor_id) || 0,
          totalStudents: Number(course.totalStudents) || Number(course.students) || 0,
          students: typeof course.students === 'number' ? course.students : undefined,
          nextClass: typeof course.nextClass === 'string' ? course.nextClass : undefined,
          progress: typeof course.progress === 'number' ? course.progress : undefined,
          content: Array.isArray(course.content) ? course.content : undefined,
        }));
        setCourses(transformedCourses);
      } else {
        throw new Error('Invalid courses data format');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add settings state
  const [systemSettings, setSystemSettings] = useState({
    general: {
      schoolName: "International Academy",
      academicYear: "2023-2024",
      currentTerm: 2,
      timezone: "Africa/Nairobi",
      dateFormat: "DD/MM/YYYY",
      language: "en",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      paymentReminders: true,
      assignmentNotifications: true,
      systemUpdates: true,
    },
    security: {
      passwordExpiration: 90,
      loginAttempts: 3,
      sessionTimeout: 30,
      twoFactorAuth: false,
    },
    academic: {
      gradingSystem: "percentage",
      passingGrade: 50,
      attendanceThreshold: 75,
      lateSubmissionPolicy: "flexible",
    },
  });

  const handleCreateCourse = async (courseData: CourseFormData) => {
    try {
      const response = await axios.post('http://localhost/E-learning/api/courses/add_course.php', courseData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        toast.success('Course created successfully');
        fetchCourses(); // Refresh the courses list
      } else {
        throw new Error(response.data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const handleEditCourse = async (courseData: CourseFormData) => {
    try {
      if (!selectedCourse) return;
      await courseService.updateCourse({
        ...courseData,
        id: selectedCourse.id,
        title: courseData.name, // Fix for UpdateCourseData
      });
      setCourses(courses.map(course =>
        course.id === selectedCourse.id ? { ...course, ...courseData, id: selectedCourse.id } : course
      ));
      setIsCourseModalOpen(false);
      setSelectedCourse(null);
      toast.success('Course updated successfully');
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
        toast.success('Course deleted successfully');
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };

  const handleUserAction = async (action: 'create' | 'update' | 'delete', userData?: Partial<User>) => {
    try {
      switch (action) {
        case 'create': {
          if (!userData) {
            toast.error('No user data provided');
            return;
          }
          const newUser = await userService.createUser({
            ...userData,
            status: 'active',
            role: userModalType,
          });
          setUsers(prev => [...prev, newUser]);
          setIsUserModalOpen(false);
          setSelectedUser(null);
          toast.success('User created successfully');
          break;
        }
        case 'update': {
          if (!userData || !selectedUser?.id) {
            toast.error('No user data or selected user');
            return;
          }
          const updatedUser = await userService.updateUser(Number(selectedUser.id), userData);
          setUsers(prev => prev.map(user =>
            user.id === updatedUser.id ? updatedUser : user
          ));
          setIsUserModalOpen(false);
          setSelectedUser(null);
          toast.success('User updated successfully');
          break;
        }
        case 'delete': {
          if (!selectedUser?.id) {
            toast.error('No user selected');
            return;
          }
          await userService.deleteUser(Number(selectedUser.id));
          setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
          setIsUserModalOpen(false);
          setSelectedUser(null);
          toast.success('User deleted successfully');
          break;
        }
      }
    } catch (error) {
      console.error('Error in user action:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleCreateSchool = async (schoolData: SchoolFormData) => {
    try {
      // Transform departments to string[] (names)
      const departments = schoolData.departments.map(dep => dep.name);
      await schoolService.createSchool({ ...schoolData, departments });
      const updatedSchools = await schoolService.getAllSchools();
      setSchools(updatedSchools);
      toast.success('School and departments created successfully');
      return true;
    } catch (error) {
      console.error('Error creating school:', error);
      toast.error('Failed to create school and departments');
      return false;
    }
  };

  const handleEditSchool = async (schoolData: SchoolFormData) => {
    try {
      if (!selectedSchool) return false;
      // Transform departments to string[] (names)
      const departments = schoolData.departments.map(dep => dep.name);
      await schoolService.updateSchool({ ...schoolData, id: selectedSchool.id, departments });
      const updatedSchools = await schoolService.getAllSchools();
      setSchools(updatedSchools);
      toast.success('School updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating school:', error);
      toast.error('Failed to update school');
      return false;
    }
  };

  const handleDeleteSchool = async (schoolId: number) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        await schoolService.deleteSchool(schoolId);
        const updatedSchools = await schoolService.getAllSchools();
        setSchools(updatedSchools);
        toast.success('School deleted successfully');
        return true;
      } catch (error) {
        console.error('Error deleting school:', error);
        toast.error('Failed to delete school');
        return false;
      }
    }
    return false;
  };

  // Add this function to handle school selection change
  const handleSchoolChange = (schoolId: string) => {
    setSchoolFilter(schoolId);
    // No setSchoolDepartments needed
  };

  const fetchSchools = async () => {
    try {
      const response = await axios.get('http://localhost/E-learning/api/schools/index.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Accept both array and object with schools property
      const schools = Array.isArray(response.data)
        ? response.data
        : response.data.schools || [];
      if (Array.isArray(schools)) {
        const formattedSchools: School[] = schools.map((school: Record<string, unknown>) => ({
          id: Number(school.id),
          name: String(school.name),
          code: String(school.code),
          description: String(school.description),
          status: school.status === 'active' ? 'active' : 'inactive',
          departments: Array.isArray(school.departments)
            ? (school.departments as Array<{ name: string }> ).map(dep => dep.name)
            : [],
          created_at: String(school.created_at) || '',
          updated_at: String(school.updated_at) || '',
        }));
        setSchools(formattedSchools);
      } else {
        throw new Error('Failed to fetch schools');
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to fetch schools');
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // 3. Add activate/deactivate user functionality in user management
  const handleToggleUserStatus = async (user: User) => {
    try {
      const updatedStatus = user.status === 'active' ? 'inactive' : 'active';
      await userService.updateUser(Number(user.id), { status: updatedStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: updatedStatus } : u));
      toast.success(`User ${updatedStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats Grid - Responsive grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center">
                  <UsersIcon className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Total Students
                    </p>
                    <p className="text-lg sm:text-2xl font-bold mt-1">
                      {systemStats.totalStudents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center">
                  <AcademicCapIcon className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Total Teachers
                    </p>
                    <p className="text-lg sm:text-2xl font-bold mt-1">
                      {systemStats.totalTeachers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center">
                  <BookOpenIcon className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Active Courses
                    </p>
                    <p className="text-lg sm:text-2xl font-bold mt-1">
                      {systemStats.activeCourses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Total Revenue
                    </p>
                    <p className="text-lg sm:text-2xl font-bold mt-1">
                      KSh {systemStats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Overview - Responsive grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Activities */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Activities
                </h2>
                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-gray-600">
                    No recent activities
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                  <Cog6ToothIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      setUserModalType('student');
                      setSelectedUser(null);
                      setUserModalMode('create');
                      setIsUserModalOpen(true);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 text-sm sm:text-base"
                  >
                    <UserPlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Add Student
                  </button>
                  <button
                    onClick={() => {
                      setUserModalType('teacher');
                      setSelectedUser(null);
                      setUserModalMode('create');
                      setIsUserModalOpen(true);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 text-sm sm:text-base"
                  >
                    <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Add Teacher
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "schools":
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                School Management
              </h2>
              <button
                onClick={() => {
                  setSelectedSchool(null);
                  setIsSchoolModalOpen(true);
                }}
                className="flex-1 sm:flex-none bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
              >
                <BuildingLibraryIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Add New School</span>
              </button>
            </div>

            {/* Schools Table */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                        >
                          School Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Code
                        </th>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Departments
                        </th>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(schools) && schools.length > 0 ? (
                        schools.map((school) => (
                          <tr key={school.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-2 sm:py-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {school.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {school.description}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                              <div className="text-xs sm:text-sm text-gray-500">
                                {school.code}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                              {/* Departments column: show names, comma separated, or a placeholder */}
                              {school.departments && school.departments.length > 0 ? (
                                <span className="text-xs text-gray-700">
                                  {school.departments.join(', ')}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">No departments</span>
                              )}
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  school.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {school.status}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedSchool(school);
                                  setIsSchoolModalOpen(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSchool(school.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-3 sm:px-6 py-4 text-center text-gray-500">
                            No schools found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* School Create/Edit Modal */}
            <CreateSchoolModal
              isOpen={isSchoolModalOpen}
              onClose={() => {
                setIsSchoolModalOpen(false);
                setSelectedSchool(null);
              }}
              onSubmit={(schoolData) => {
                if (selectedSchool) {
                  handleEditSchool(schoolData);
                } else {
                  handleCreateSchool(schoolData);
                }
                setIsSchoolModalOpen(false);
              }}
              editData={selectedSchool ? {
                name: selectedSchool.name,
                code: selectedSchool.code,
                description: selectedSchool.description,
                status: selectedSchool.status,
                departments: selectedSchool.departments.map(dep => ({ name: dep, code: '', description: '' })),
              } : undefined}
            />
          </div>
        );

      case "users":
        return (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                User Management
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setUserModalType('student');
                    setSelectedUser(null);
                    setUserModalMode('create');
                    setIsUserModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
                >
                  <UserPlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add Student
                </button>
                <button
                  onClick={() => {
                    setUserModalType('teacher');
                    setSelectedUser(null);
                    setUserModalMode('create');
                    setIsUserModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
                >
                  <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add Teacher
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users
                      .filter((user) => {
                        const matchesSearch =
                          searchTerm === "" ||
                          (user.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (user.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                        const matchesRole =
                          roleFilter === "" || user.role === roleFilter;
                        const matchesStatus =
                          statusFilter === "" || user.status === statusFilter;
                        return matchesSearch && matchesRole && matchesStatus;
                      })
                      .map((user) => (
                        <tr key={user.id}>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-medium">
                                  {(user.first_name || '').charAt(0)}
                                  {(user.last_name || '').charAt(0)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name || ''} {user.last_name || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email || ''}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : user.status === "inactive"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.status || "active"}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className={user.status === 'active' ? 'text-gray-400 hover:text-gray-700' : 'text-green-600 hover:text-green-900'}
                              title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "departments":
        return (
         <Departments />
        );

      case "finance": {
        return <Finance />;
      }

      case "courses":
        return (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">Course Management</h2>
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setIsCourseModalOpen(true);
                }}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Add New Course
              </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center space-x-2">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="flex-1 border-0 focus:ring-0"
                    value={courseSearchTerm}
                    onChange={(e) => setCourseSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="border-gray-300 rounded-md text-sm"
                    value={schoolFilter}
                    onChange={(e) => handleSchoolChange(e.target.value)}
                  >
                    <option value="">All Schools</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border-gray-300 rounded-md text-sm"
                    value={courseStatusFilter}
                    onChange={(e) => setCourseStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses
                      .filter((course) => {
                        if (!course) return false;
                        const matchesSearch = course.code?.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
                          course.name?.toLowerCase().includes(courseSearchTerm.toLowerCase());
                        const matchesSchool = !schoolFilter || course.school === schoolFilter;
                        const matchesStatus = !courseStatusFilter || course.status === courseStatusFilter;
                        return matchesSearch && matchesSchool && matchesStatus;
                      })
                      .slice((currentCoursePage - 1) * coursesPerPage, currentCoursePage * coursesPerPage)
                      .map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{course.code}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{course.name}</div>
                            <div className="text-sm text-gray-500">{course.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{course.school}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{course.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{course.instructor}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.totalStudents}/{course.content?.length || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setIsCourseModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentCoursePage(prev => Math.max(1, prev - 1))}
                    disabled={currentCoursePage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentCoursePage(prev => prev + 1)}
                    disabled={currentCoursePage * coursesPerPage >= courses.length}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentCoursePage - 1) * coursesPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentCoursePage * coursesPerPage, courses.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{courses.length}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentCoursePage(prev => Math.max(1, prev - 1))}
                        disabled={currentCoursePage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentCoursePage(prev => prev + 1)}
                        disabled={currentCoursePage * coursesPerPage >= courses.length}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Create/Edit Modal */}
            <CreateCourseModal
              isOpen={isCourseModalOpen}
              onClose={() => {
                setIsCourseModalOpen(false);
                setSelectedCourse(null);
              }}
              onSubmit={(courseData) => {
                if (selectedCourse) {
                  handleEditCourse(courseData);
                } else {
                  handleCreateCourse(courseData);
                }
                setIsCourseModalOpen(false);
              }}
              editData={selectedCourse ? {
                code: selectedCourse.code,
                name: selectedCourse.name,
                description: selectedCourse.description,
                credits: selectedCourse.credits,
                school_id: 0, // You may need to map school name to ID
                department_id: 0, // You may need to map department name to ID
                instructor_id: selectedCourse.instructorId,
                status: selectedCourse.status as 'active' | 'inactive',
                enrollment_capacity: 0, // Not available in Course, set default or map if available
                start_date: '', // Not available in Course, set default or map if available
                end_date: '', // Not available in Course, set default or map if available
                schedule: [], // Not available in Course, set default or map if available
                prerequisites: [], // Not available in Course, set default or map if available
              } : undefined}
            />
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            {/* Settings Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                System Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure your system preferences and administrative settings
              </p>
            </div>

            {/* General Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                General Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={systemSettings.general.schoolName}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        general: {
                          ...prev.general,
                          schoolName: e.target.value,
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={systemSettings.general.academicYear}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        general: {
                          ...prev.general,
                          academicYear: e.target.value,
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Term
                  </label>
                  <select
                    value={systemSettings.general.currentTerm}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        general: {
                          ...prev.general,
                          currentTerm: Number(e.target.value),
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={1}>Term 1</option>
                    <option value={2}>Term 2</option>
                    <option value={3}>Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Time Zone
                  </label>
                  <select
                    value={systemSettings.general.timezone}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, timezone: e.target.value },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Africa/Nairobi">
                      East Africa Time (EAT)
                    </option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-gray-500">
                      Receive important updates via email
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          emailNotifications:
                            !prev.notifications.emailNotifications,
                        },
                      }))
                    }
                    className={`${
                      systemSettings.notifications.emailNotifications
                        ? "bg-purple-600"
                        : "bg-gray-200"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        systemSettings.notifications.emailNotifications
                          ? "translate-x-6"
                          : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      SMS Notifications
                    </h4>
                    <p className="text-sm text-gray-500">
                      Receive alerts via SMS
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          smsNotifications:
                            !prev.notifications.smsNotifications,
                        },
                      }))
                    }
                    className={`${
                      systemSettings.notifications.smsNotifications
                        ? "bg-purple-600"
                        : "bg-gray-200"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        systemSettings.notifications.smsNotifications
                          ? "translate-x-6"
                          : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Security Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password Expiration (days)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.security.passwordExpiration}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          passwordExpiration: Number(e.target.value),
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={systemSettings.security.loginAttempts}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          loginAttempts: Number(e.target.value),
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.security.sessionTimeout}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          sessionTimeout: Number(e.target.value),
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">
                    Two-Factor Authentication
                  </label>
                  <button
                    onClick={() =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          twoFactorAuth: !prev.security.twoFactorAuth,
                        },
                      }))
                    }
                    className={`${
                      systemSettings.security.twoFactorAuth
                        ? "bg-purple-600"
                        : "bg-gray-200"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        systemSettings.security.twoFactorAuth
                          ? "translate-x-6"
                          : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Academic Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Academic Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Grading System
                  </label>
                  <select
                    value={systemSettings.academic.gradingSystem}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        academic: {
                          ...prev.academic,
                          gradingSystem: e.target.value as
                            | "letter"
                            | "percentage"
                            | "gpa",
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="letter">Letter Grade (A, B, C...)</option>
                    <option value="percentage">Percentage</option>
                    <option value="gpa">GPA (4.0 Scale)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Passing Grade (%)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.academic.passingGrade}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        academic: {
                          ...prev.academic,
                          passingGrade: Number(e.target.value),
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Attendance Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.academic.attendanceThreshold}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        academic: {
                          ...prev.academic,
                          attendanceThreshold: Number(e.target.value),
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Late Submission Policy
                  </label>
                  <select
                    value={systemSettings.academic.lateSubmissionPolicy}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        academic: {
                          ...prev.academic,
                          lateSubmissionPolicy: e.target.value as
                            | "strict"
                            | "flexible"
                            | "none",
                        },
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="strict">Strict (No Late Submissions)</option>
                    <option value="flexible">Flexible (With Penalty)</option>
                    <option value="none">None (Accept All Submissions)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  // Here you would typically save the settings to your backend
                  alert("Settings saved successfully!");
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
            <p className="mt-2 text-gray-500">
              This feature is under development.
            </p>
          </div>
        );
    }
  };

  // When opening the modal for editing a user, set userModalMode to 'update' (never 'edit')
  // Example: setUserModalMode('update')
  const handleUserModalConfirm = (userData?: Partial<User>) => {
    handleUserAction(userModalMode, userData);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button - Moved outside the header and adjusted z-index */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50"
      >
        {isSidebarOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Dashboard Header */}
      <DashboardHeader 
        userRole={user?.role || 'admin'} 
        userName={`${user?.firstName || ''} ${user?.lastName || ''}`} 
      />

      {/* Responsive Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-lg`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute right-4 top-4 p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Admin Portal</h2>
              <p className="text-sm text-gray-500">System Management</p>
            </div>
          </div>
          <div className="h-0.5 bg-gray-100 w-full mb-6"></div>
          <nav className="space-y-2">
            {[
              { id: "overview", icon: ChartBarIcon, label: "Overview" },
              { id: "schools", icon: BuildingLibraryIcon, label: "Schools" },
              { id: "departments", icon: BuildingLibraryIcon, label: "Departments" },
              { id: "users", icon: UsersIcon, label: "User Management" },
              { id: "courses", icon: BookOpenIcon, label: "Course Management" },
              {
                id: "finance",
                icon: CurrencyDollarIcon,
                label: "Financial Overview",
              },
              { id: "settings", icon: Cog6ToothIcon, label: "System Settings" },
            ].map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`flex items-center p-3 rounded-xl transition-all duration-200
                  ${
                    activeTab === item.id
                      ? "bg-purple-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${
                    activeTab === item.id ? "text-white" : ""
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 min-h-screen ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-64"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Banner */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                    Welcome back, Admin! 👋
                  </h1>
                  <p className="text-purple-100">
                    Here's an overview of your system's performance.
                  </p>
                </div>
                {activeTab === "users" && (
                  <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setUserModalType('student');
                        setSelectedUser(null);
                        setUserModalMode('create');
                        setIsUserModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 text-sm sm:text-base"
                    >
                      <UserPlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Add Student
                    </button>
                    <button
                      onClick={() => {
                        setUserModalType('teacher');
                        setSelectedUser(null);
                        setUserModalMode('create');
                        setIsUserModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 text-sm sm:text-base"
                    >
                      <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Add Teacher
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Render content based on active tab */}
          {renderContent()}
        </div>
      </main>
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        mode={userModalMode === 'update' ? 'edit' : userModalMode}
        user={selectedUser}
        onConfirm={handleUserModalConfirm}
      />
    </div>
  );
};

export default AdminDashboard;
