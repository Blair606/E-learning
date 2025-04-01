import React from 'react';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
  status: 'active' | 'inactive';
  department?: string;
  joinDate: string;
}

interface School {
  id: string;
  name: string;
  departments?: string[];
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
  userType: 'student' | 'teacher';
  schools: School[];
  departments: string[];
}

const UserModal = ({ isOpen, onClose, onSubmit, userType, schools, departments }: UserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    status: 'active',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    school: ''
  });

  useEffect(() => {
    if (userType === 'student') {
      setFormData({
        name: '',
        email: '',
        role: 'student',
        status: 'active',
        department: '',
        joinDate: new Date().toISOString().split('T')[0],
        school: ''
      });
    } else if (userType === 'teacher') {
      setFormData({
        name: '',
        email: '',
        role: 'teacher',
        status: 'active',
        department: '',
        joinDate: new Date().toISOString().split('T')[0],
        school: ''
      });
    }
  }, [userType]);

  const handleSchoolChange = (schoolId: string) => {
    setFormData(prev => ({
      ...prev,
      school: schoolId,
      department: ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {userType === 'student' ? 'Add New Student' : 'Add New Teacher'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
          onClose();
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">School</label>
              <select
                value={formData.school}
                onChange={(e) => handleSchoolChange(e.target.value)}
                required
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                disabled={!formData.school}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Join Date</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
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
              {userType === 'student' ? 'Add Student' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal; 