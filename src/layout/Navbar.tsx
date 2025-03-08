import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">EduPortal</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/learner/login"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Learner
            </Link>
            <Link
              to="/tutor/login"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Tutor
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;