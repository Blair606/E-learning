import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  AcademicCapIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const HomePage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Student Portal',
      description: 'Access your courses, assignments, and track your academic progress',
      icon: UserIcon,
      path: '/login/student',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Teacher Portal',
      description: 'Manage courses, students, and track academic performance',
      icon: AcademicCapIcon,
      path: '/login/teacher',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Parent Portal',
      description: 'Monitor your child\'s progress and manage finances',
      icon: UserGroupIcon,
      path: '/login/parent',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <Navbar />

      {/* hero section */}
      <main className="flex-grow">
        <div className="max-w-[95%] mx-auto px-2 py-8 md:py-16">
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              Welcome to Edu Portal
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Your comprehensive learning management system. Choose your portal to get started.
            </p>
          </div>

          {/* Portal Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto px-4">
            {roles.map((role) => (
              <div
                key={role.title}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
              >
                <div className={`${role.color} p-4 md:p-6 text-white`}>
                  <role.icon className="w-8 h-8 md:w-12 md:h-12 mb-4" />
                  <h2 className="text-xl md:text-2xl font-semibold mb-2">{role.title}</h2>
                  <p className="text-sm opacity-90">{role.description}</p>
                </div>
                <div className="p-4 md:p-6">
                  <button
                    onClick={() => navigate(role.path)}
                    className="w-full bg-gray-900 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Access Portal
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-16 md:mt-24 text-center px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12">
              Why Choose EduPortal?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="p-6">
                <div className="text-blue-500 mb-4">
                  <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                <p className="text-gray-600">Stay informed with instant notifications and updates</p>
              </div>
              <div className="p-6">
                <div className="text-green-500 mb-4">
                  <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
                <p className="text-gray-600">Protected portals with role-based authentication</p>
              </div>
              <div className="p-6">
                <div className="text-purple-500 mb-4">
                  <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
                <p className="text-gray-600">Intuitive interface for all user roles</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;