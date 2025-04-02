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
import CourseDetailsModal from "../../components/modals/CourseDetailsModal";
import CreateUserModal from "../../components/modals/CreateUserModal";
import { User, Student, Teacher } from "../../types/user";

import "react-datepicker/dist/react-datepicker.css";

import { userService } from '../../services/userService';
import UserManagementModal from "../../components/modals/UserManagementModal";
import Finance from "./admincomponents/Finance";
import Departments from "./admincomponents/Departments";
import CreateSchoolModal, { SchoolFormData } from "../../components/modals/CreateSchoolModal";
import { schoolService } from '../../services/schoolService';
import type { School, Department } from '../../types/school';

interface UserFilters {
  role: 'all' | 'teacher' | 'student' | 'admin';
  status: 'all' | 'active' | 'inactive';
  department: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Add Course related interfaces
interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  school: "SASA" | "SBE" | "SED" | "SEES" | "SHHS" | "HSSS" | "SPAS";
  department: string;
  instructor: string;
  status: "active" | "inactive";
  enrollmentCapacity: number;
  currentEnrollment: number;
  startDate: string;
  endDate: string;
  schedule: {
    day: string;
    time: string;
    duration: number;
  }[];
  prerequisites: string[];
}

// Add School interface
interface School {
  id: string;
  name: string;
  code: string;
  description: string;
  status: "active" | "inactive";
  departments: string[];
  createdAt: string;
  updatedAt: string;
}

// Add Department interface
interface Department {
  id: string;
  name: string;
  code: string;
  schoolId: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

// Add new interfaces for settings
interface SystemSettings {
  general: {
    schoolName: string;
    academicYear: string;
    currentTerm: number;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    paymentReminders: boolean;
    assignmentNotifications: boolean;
    systemUpdates: boolean;
  };
  security: {
    passwordExpiration: number;
    loginAttempts: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };
  academic: {
    gradingSystem: "letter" | "percentage" | "gpa";
    passingGrade: number;
    attendanceThreshold: number;
    lateSubmissionPolicy: "strict" | "flexible" | "none";
  };
}

const AdminDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [systemStats] = useState({
    totalStudents: 1250,
    totalTeachers: 75,
    activeCourses: 48,
    departments: 12,
    totalRevenue: 15000000,
    pendingPayments: 2500000,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [users, setUsers] = useState<User[]>([]); // Initialize as an empty array

  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalType, setUserModalType] = useState<'student' | 'teacher'>('student');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      code: "CS101",
      title: "Introduction to Computer Science",
      description: "Fundamental concepts of programming and computer science",
      credits: 3,
      school: "SPAS",
      department: "Computer Science",
      instructor: "John Doe",
      status: "active",
      enrollmentCapacity: 50,
      currentEnrollment: 35,
      startDate: "2024-01-15",
      endDate: "2024-05-15",
      schedule: [
        { day: "Monday", time: "09:00", duration: 2 },
        { day: "Wednesday", time: "09:00", duration: 2 },
      ],
      prerequisites: [],
    },
    {
      id: "2",
      code: "MATH201",
      title: "Advanced Calculus",
      description: "Advanced concepts in calculus and mathematical analysis",
      credits: 4,
      school: "SPAS",
      department: "Mathematics",
      instructor: "Jane Smith",
      status: "active",
      enrollmentCapacity: 40,
      currentEnrollment: 38,
      startDate: "2024-01-15",
      endDate: "2024-05-15",
      schedule: [
        { day: "Tuesday", time: "11:00", duration: 2 },
        { day: "Thursday", time: "11:00", duration: 2 },
      ],
      prerequisites: ["MATH101"],
    },
  ]);

  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState("");
  const [currentCoursePage, setCurrentCoursePage] = useState(1);
  const coursesPerPage = 10;

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editCourseData, setEditCourseData] = useState<
    CourseFormData | undefined
  >();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Add state for schools
  const [schools, setSchools] = useState<School[]>([]);

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Add this state to track departments for the selected school
  const [schoolDepartments, setSchoolDepartments] = useState<string[]>([]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsData = await schoolService.getAllSchools();
        setSchools(schoolsData);
      } catch (error) {
        console.error('Error fetching schools:', error);
        // You might want to show an error message to the user here
      }
    };

    fetchSchools();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error('Failed to fetch users: Invalid response format');
        alert('Failed to fetch users. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to fetch users. Please try again later.');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await userService.deleteUser(userId) as ApiResponse<void>;
      if (response.success) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        throw new Error(response.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to delete user. Please try again later.');
      }
    }
  };

  // Add settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
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

  const handleCreateCourse = (courseData: CourseFormData) => {
    const newCourse: Course = {
      ...courseData,
      id: String(courses.length + 1),
      currentEnrollment: 0,
    };
    setCourses([...courses, newCourse]);
  };

  const handleEditCourse = (courseData: CourseFormData) => {
    setCourses(
      courses.map((course) =>
        course.id === courseData.id ? { ...course, ...courseData } : course
      )
    );
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter((course) => course.id !== courseId));
    }
  };

  const handleCreateUser = (userData: Partial<Student | Teacher>) => {
    const newUser = {
      ...userData,
      id: String(users.length + 1),
    } as User;
    setUsers([...users, newUser]);
  };

  const handleCreateSchool = async (schoolData: SchoolFormData) => {
    try {
      const response = await schoolService.createSchool(schoolData);
      // Refresh the schools list
      const updatedSchools = await schoolService.getAllSchools();
      setSchools(updatedSchools);
      return true;
    } catch (error) {
      console.error('Error creating school:', error);
      // You might want to show an error message to the user here
      return false;
    }
  };

  const handleEditSchool = async (schoolData: SchoolFormData) => {
    try {
      if (!selectedSchool) return false;
      
      const response = await schoolService.updateSchool({
        ...schoolData,
        id: selectedSchool.id
      });
      
      // Refresh the schools list
      const updatedSchools = await schoolService.getAllSchools();
      setSchools(updatedSchools);
      return true;
    } catch (error) {
      console.error('Error updating school:', error);
      // You might want to show an error message to the user here
      return false;
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        const response = await schoolService.deleteSchool(parseInt(schoolId));
        // Refresh the schools list
        const updatedSchools = await schoolService.getAllSchools();
        setSchools(updatedSchools);
        return true;
      } catch (error) {
        console.error('Error deleting school:', error);
        // You might want to show an error message to the user here
        return false;
      }
    }
    return false;
  };

  // Add this function to handle school selection change
  const handleSchoolChange = (schoolId: string) => {
    setSchoolFilter(schoolId);
    
    // Find the selected school and update departments
    const selectedSchool = schools.find(school => school.id === schoolId);
    if (selectedSchool) {
      setSchoolDepartments(selectedSchool.departments || []);
    } else {
      setSchoolDepartments([]);
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
                      setShowUserModal(true);
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
                      setShowUserModal(true);
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
                      {schools.map((school) => (
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
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <div className="flex flex-wrap gap-1">
                              {school.departments.map((dept) => (
                                <span
                                  key={dept}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                                >
                                  {dept}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full ${
                                school.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {school.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <div className="flex space-x-2 sm:space-x-3">
                              <button
                                onClick={() => {
                                  setSelectedSchool(school);
                                  setIsSchoolModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSchool(school.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
              editData={selectedSchool || undefined}
            />
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">User Management</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setUserModalType('student');
                    setSelectedUser(null);
                    setUserModalMode('create');
                    setShowUserModal(true);
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
                    setShowUserModal(true);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 text-sm sm:text-base"
                >
                  <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add Teacher
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center space-x-2">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="flex-1 border-0 focus:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="border-gray-300 rounded-md text-sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as UserFilters['role'])}
                  >
                    <option value="all">All Roles</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                    <option value="admin">Admins</option>
                  </select>
                  <select
                    className="border-gray-300 rounded-md text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as UserFilters['status'])}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Join Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'teacher' ? 'bg-green-100 text-green-800' : 
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.department || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.status?.charAt(0).toUpperCase() + (user.status?.slice(1) || '')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt || '').toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setUserModalType(user.role as 'student' | 'teacher');
                              setSelectedUser(user);
                              setUserModalMode('edit');
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setUserModalMode('delete');
                              handleUserAction();
                            }}
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
            </div>

            {/* Create/Edit User Modal */}
            <CreateUserModal
              isOpen={showUserModal}
              onClose={() => {
                setShowUserModal(false);
                setSelectedUser(null);
              }}
              onSubmit={handleUserAction}
              userType={userModalType}
              editData={selectedUser || undefined}
            />
          </div>
        );

      case "departments":
        return (
         <Departments />
        );

      case "finance": {
        return <Finance />;
      }

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

  const handleUserAction = async (userData?: Partial<User>) => {
    try {
      if (userModalMode === "delete" && selectedUser?.id) {
        const confirmed = window.confirm(
          `Are you sure you want to delete ${selectedUser.firstName}?`
        );
        if (confirmed) {
          await userService.deleteUser(selectedUser.id);
          alert("User deleted successfully");
          setSelectedUser(null);
          setUserModalMode("create");
          await fetchUsers(); // Refresh the users list
        }
      } else if (userData && selectedUser?.id) {
        // Only include password in update if it's not empty
        const updateData = { ...userData };
        if (!updateData.password) {
          delete updateData.password;
        }

        await userService.updateUser(selectedUser.id, updateData);
        alert("User updated successfully");
        setSelectedUser(null);
        setUserModalMode("create");
        await fetchUsers(); // Refresh the users list
      } else if (userData) {
        // Create new user
        await userService.createUser(userData);
        alert("User created successfully");
        await fetchUsers(); // Refresh the users list
      }
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Error: ${errorMessage}`);
      console.error("Error handling user action:", error);
    } finally {
      setShowUserModal(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 right-0 left-0 lg:left-64 z-10 transition-all duration-300">
        <DashboardHeader
          userRole="Administrator"
          userName={`${user?.firstName} ${user?.lastName}` || "Admin"}
        />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50"
      >
        {isSidebarOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Responsive Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
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
                        setShowUserModal(true);
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
                        setShowUserModal(true);
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
        mode={userModalMode === 'create' ? 'edit' : userModalMode}
        user={selectedUser}
        onConfirm={handleUserAction}
      />
    </div>
  );
};

export default AdminDashboard;
