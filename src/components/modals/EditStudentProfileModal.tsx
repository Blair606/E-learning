import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  school_id?: number;
  department_id?: number;
}

interface EditStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: User) => void;
  user: User | null;
}

const EditStudentProfileModal: React.FC<EditStudentProfileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user
}) => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<Array<{ id: number; name: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: number; name: string; school_id: number }>>([]);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    schoolId: user?.school_id || '',
    departmentId: user?.department_id || '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchSchools();
      if (formData.schoolId) {
        fetchDepartments(formData.schoolId);
      }
    }
  }, [isOpen, formData.schoolId]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('http://localhost/E-learning/api/schools/index.php');
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      const data = await response.json();
      if (data.success && data.schools) {
        setSchools(data.schools.map((school: any) => ({
          id: school.id,
          name: school.name
        })));
      } else {
        throw new Error(data.message || 'Failed to fetch schools');
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch schools');
    }
  };

  const fetchDepartments = async (schoolId: number) => {
    try {
      const response = await fetch(`http://localhost/E-learning/api/departments/index.php?school_id=${schoolId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setDepartments(data.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          school_id: dept.school_id
        })));
      } else {
        throw new Error(data.message || 'Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch departments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ensure school_id and department_id are numbers
    const schoolId = formData.schoolId ? Number(formData.schoolId) : null;
    const departmentId = formData.departmentId ? Number(formData.departmentId) : null;

    try {
      const requestData = {
        id: user?.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        school_id: schoolId,
        department_id: departmentId
      };

      console.log('Sending data:', requestData); // Debug log

      const response = await fetch('http://localhost/E-learning/api/students/update_profile.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.success && data.data) {
        // Log the updated data to verify school and department
        console.log('Updated user data:', data.data);
        onSubmit(data.data);
        onClose();
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
            <select
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.schoolId}
              onChange={(e) => {
                const schoolId = parseInt(e.target.value);
                setFormData(prev => ({ ...prev, schoolId, departmentId: '' }));
                if (schoolId) {
                  fetchDepartments(schoolId);
                }
              }}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.departmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
              disabled={!formData.schoolId}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentProfileModal; 