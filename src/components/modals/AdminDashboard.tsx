import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  UserPlusIcon,
  BuildingLibraryIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import DashboardHeader from '../../components/DashboardHeader';
import UserModal from '../../components/modals/UserModal';
import CourseModal from '../../components/modals/CourseModal';
import DepartmentModal from '../../components/modals/DepartmentModal';
import UserManagementModal from '../../components/modals/UserManagementModal';
import axios from 'axios';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
  status: 'active' | 'inactive';
  department?: string;
  joinDate: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  teacher: string;
  students: number;
  status: 'active' | 'inactive';
}

interface UserFilters {
  role: 'all' | 'teacher' | 'student' | 'admin';
  status: 'all' | 'active' | 'inactive';
  department: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  courses: number;
  teachers: number;
  students: number;
  status: 'active' | 'inactive';
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalMode, setUserModalMode] = useState<'edit' | 'delete'>('edit');
  const [userFilters, setUserFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    department: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([
    {
      id: '1',
      name: 'Computer Science',
      head: 'Dr. Sarah Chen',
      courses: 12,
      teachers: 8,
      students: 150,
      status: 'active'
    },
    {
      id: '2',
      name: 'Engineering',
      head: 'Prof. James Wilson',
      courses: 15,
      teachers: 10,
      students: 200,
      status: 'active'
    },
    // Add more departments...
  ]);

  const [users, setUsers] = useState<User[]>([]); // Initialize as an empty array

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost/E-learning/api/users/index.php');
            console.log('API Response:', response.data);
            
            // Transform the data if needed
            const transformedUsers = response.data.map((user: any) => ({
              id: user.id,
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              email: user.email || '',
              role: user.role || 'student',
              status: user.status || 'active',
              department: user.department || '',
              joinDate: user.created_at || new Date().toISOString()
            }));
            
            setUsers(transformedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users. Please try again later.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);



    
  
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      code: 'CS301',
      name: 'Machine Learning',
      department: 'Computer Science',
      teacher: 'Dr. Sarah Chen',
      students: 45,
      status: 'active'
    },
    // Add more courses...
  ]);

  const [systemStats] = useState({
    totalStudents: 1250,
    totalTeachers: 75,
    activeCourses: 48,
    departments: 12,
    totalRevenue: 15000000,
    pendingPayments: 2500000,
  });

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const navItems = [
    { id: 'overview', icon: ChartBarIcon, label: 'Overview' },
    { id: 'users', icon: UsersIcon, label: 'User Management' },
    { id: 'courses', icon: BookOpenIcon, label: 'Course Management' },
    { id: 'departments', icon: BuildingLibraryIcon, label: 'Departments' },
    { id: 'finance', icon: CurrencyDollarIcon, label: 'Financial Overview' },
    { id: 'settings', icon: Cog6ToothIcon, label: 'System Settings' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold mt-1">{systemStats.totalStudents}</p>
                  </div>
                  <UsersIcon className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Teachers</p>
                    <p className="text-2xl font-bold mt-1">{systemStats.totalTeachers}</p>
                  </div>
                  <AcademicCapIcon className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Courses</p>
                    <p className="text-2xl font-bold mt-1">{systemStats.activeCourses}</p>
                  </div>
                  <BookOpenIcon className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
                {/* Add activity list */}
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setUserModalType('student');
                      setSelectedUser(null);
                      setUserModalMode('create');
                      setShowUserModal(true);
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
                      setShowUserModal(true);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
                  >
                    <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Add Teacher
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">User Management</h2>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setUserModalMode('edit');
                  setShowUserModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Add New User
              </button>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="border-gray-300 rounded-md text-sm"
                    value={userFilters.role}
                    onChange={(e) => setUserFilters({...userFilters, role: e.target.value as UserFilters['role']})}
                  >
                    <option value="all">All Roles</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                    <option value="admin">Admins</option>
                  </select>
                  <select
                    className="border-gray-300 rounded-md text-sm"
                    value={userFilters.status}
                    onChange={(e) => setUserFilters({...userFilters, status: e.target.value as UserFilters['status']})}
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
                                  {user.first_name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
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
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setUserModalMode('edit');
                              setUserModalType(user.role as 'student' | 'teacher');
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
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
          </div>
        );

      case 'courses':
        return (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">Course Management</h2>
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setShowCourseModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Add New Course
              </button>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                        <p className="text-sm text-gray-500">{course.code}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Department: {course.department}</p>
                      <p>Teacher: {course.teacher}</p>
                      <p>Students Enrolled: {course.students}</p>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowCourseModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {courses.length === 0 && (
              <div className="text-center py-12">
                <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
              </div>
            )}
          </div>
        );

      case 'departments':
        return (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">Department Management</h2>
              <button
                onClick={() => {
                  setSelectedDepartment(null);
                  setShowDepartmentModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <BuildingLibraryIcon className="w-5 h-5 mr-2" />
                Add Department
              </button>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentsList.map((dept) => (
                <div key={dept.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                        <p className="text-sm text-gray-500">Head: {dept.head}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        dept.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {dept.status.charAt(0).toUpperCase() + dept.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Courses</p>
                        <p className="text-lg font-semibold text-blue-600">{dept.courses}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Teachers</p>
                        <p className="text-lg font-semibold text-green-600">{dept.teachers}</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Students</p>
                        <p className="text-lg font-semibold text-purple-600">{dept.students}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setShowDepartmentModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'finance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Financial Overview</h2>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1">
                      ${(systemStats.totalRevenue / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <CurrencyDollarIcon className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold mt-1">
                      ${(systemStats.pendingPayments / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <ClockIcon className="w-12 h-12 text-yellow-500" />
                </div>
              </div>

              {/* Add more financial stats cards */}
            </div>

            {/* Financial Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                {/* Add revenue chart here */}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                {/* Add transactions table here */}
              </div>
            </div>
          </div>
        );

      // Add more cases for other tabs...
    }
  };

  const handleUserSubmit = async (userData: Partial<User>) => {
    try {
      const userDataToSubmit = {
        ...userData,
        role: userModalMode, // Set the role based on userModalMode
        status: userData.status || 'active',
      };

      if (selectedUser) {
        // Update existing user
        const response = await axios.put(`http://localhost/E-learning/api/users/index.php?id=${selectedUser.id}`, userDataToSubmit);
        console.log('Update response:', response.data);
      } else {
        // Add new user
        const response = await axios.post('http://localhost/E-learning/api/users/index.php', userDataToSubmit);
        console.log('Create response:', response.data);
      }
      
      // Refresh the users list
      fetchUsers();
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again later.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await axios.delete(`http://localhost/E-learning/api/users/index.php?id=${userId}`);
        console.log('Delete response:', response.data);
        
        // Refresh the users list
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again later.');
      }
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(course => course.id !== courseId));
    }
  };

  const handleDeleteDepartment = (deptId: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setDepartmentsList(prev => prev.filter(dept => dept.id !== deptId));
    }
  };

  const handleCourseSubmit = (courseData: Omit<Course, 'id' | 'students'>) => {
    if (selectedCourse) {
      // Update existing course
      const updatedCourses = courses.map(course => 
        course.id === selectedCourse.id 
          ? { ...courseData, id: course.id, students: course.students }
          : course
      );
      setCourses(updatedCourses);
    } else {
      // Add new course
      const newCourse = {
        ...courseData,
        id: (courses.length + 1).toString(),
        students: 0
      };
      setCourses([...courses, newCourse]);
    }
    setShowCourseModal(false);
  };

  const handleDepartmentSubmit = (departmentData: Omit<Department, 'id' | 'courses' | 'teachers' | 'students'>) => {
    if (selectedDepartment) {
      // Update existing department
      const updatedDepartments = departmentsList.map(dept => 
        dept.id === selectedDepartment.id 
          ? { 
              ...departmentData, 
              id: dept.id,
              courses: dept.courses,
              teachers: dept.teachers,
              students: dept.students
            }
          : dept
      );
      setDepartmentsList(updatedDepartments);
    } else {
      // Add new department
      const newDepartment = {
        ...departmentData,
        id: (departmentsList.length + 1).toString(),
        courses: 0,
        teachers: 0,
        students: 0
      };
      setDepartmentsList([...departmentsList, newDepartment]);
    }
    setShowDepartmentModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userRole="Administrator" userName="Admin Name" />
      
      {/* Sidebar */}
      <div className={`
        fixed w-64 h-full bg-white shadow-lg transition-transform duration-300 z-40
        lg:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar content */}
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Admin Portal</h2>
              <p className="text-sm text-gray-500">System Management</p>
            </div>
          </div>
          
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
      </div>

      {/* Main Content */}
      <div className={`pt-20 p-4 sm:p-6 lg:p-8 lg:ml-64 transition-all duration-300`}>
        {renderContent()}
      </div>

      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        mode={userModalMode}
        user={selectedUser}
        onConfirm={handleUserSubmit}
        userType={userModalMode}
        schools={schools}
        departments={departmentsList.map(dept => dept.name)}
      />

      <CourseModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        onSubmit={handleCourseSubmit}
        course={selectedCourse}
        departments={departmentsList.map(dept => dept.name)}
        teachers={users
          .filter(user => user.role === 'teacher')
          .map(teacher => ({ id: teacher.id, name: teacher.first_name }))
        }
      />

      <DepartmentModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSubmit={handleDepartmentSubmit}
        department={selectedDepartment}
        teachers={users
          .filter(user => user.role === 'teacher')
          .map(teacher => ({ id: teacher.id, name: teacher.first_name }))
        }
      />
    </div>
  );
};

export default AdminDashboard; 