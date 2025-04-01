import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Student, Teacher } from '../../types/user';
import { schoolService, School, Department } from '../../services/schoolService';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<Student | Teacher>) => void;
  userType: 'student' | 'teacher';
  editData?: Partial<Student | Teacher>;
}

const CreateUserModal = ({ isOpen, onClose, onSubmit, userType, editData }: CreateUserModalProps) => {
  const [formData, setFormData] = useState<Partial<Student | Teacher>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: userType,
    status: 'active',
    school: '',
    department: '',
    ...(userType === 'student' ? {
      studentId: '',
      grade: '',
      enrollmentDate: '',
      specialization: '',
      education: ''
    } : {
      teacherId: '',
    }),
    ...(editData || {})
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Function to generate user ID based on role
  const generateUserId = (role: string): string => {
    const prefix = role === 'student' ? 'STD' : 
                  role === 'teacher' ? 'TCH' : 
                  role === 'admin' ? 'ADM' : 'PRT';
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}/${randomNum}/${year}`;
  };

  // Update role-specific ID when role changes
  useEffect(() => {
    if (!editData) {
      const newId = generateUserId(formData.role);
      setFormData(prev => ({
        ...prev,
        studentId: formData.role === 'student' ? newId : '',
        teacherId: formData.role === 'teacher' ? newId : ''
      }));
    }
  }, [formData.role, editData]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const schoolsData = await schoolService.getAllSchools();
        console.log('Fetched schools:', schoolsData);
        setSchools(schoolsData);
      } catch (err) {
        setError('Failed to load schools');
        console.error('Error loading schools:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (formData.school) {
        try {
          setLoading(true);
          console.log('Fetching departments for school:', formData.school);
          console.log('Available schools:', schools);
          
          // Find the selected school - convert both to strings for comparison
          const selectedSchool = schools.find(s => String(s.id) === String(formData.school));
          console.log('Selected school:', selectedSchool);
          
          if (selectedSchool) {
            console.log('Fetching departments for school:', selectedSchool.id);
            // Use the existing method to fetch departments by school ID
            const departmentsData = await schoolService.getDepartmentsBySchool(selectedSchool.id);
            console.log('Departments response:', departmentsData);
            
            if (!departmentsData || departmentsData.length === 0) {
              console.log('No departments found for school:', selectedSchool.id);
              setError('No departments found for this school');
            } else {
              setError('');
              setDepartments(departmentsData);
            }
          } else {
            console.log('Selected school not found:', selectedSchool);
            setError('School not found');
          }
        } catch (err) {
          console.error('Error loading departments:', err);
          setError('Failed to load departments. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No school selected, clearing departments');
        setDepartments([]);
        setError('');
      }
    };
    fetchDepartments();
  }, [formData.school, schools]);

  // Add console log for departments state changes
  useEffect(() => {
    console.log('Departments state updated:', departments);
  }, [departments]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: userType,
        status: 'active',
        school: '',
        department: '',
        ...(userType === 'student' ? {
          studentId: '',
          grade: '',
          enrollmentDate: '',
          specialization: '',
          education: ''
        } : {
          teacherId: '',
        })
      });
      setErrors({});
      setDepartments([]);
    }
  }, [isOpen, userType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password?.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.school?.trim()) newErrors.school = 'School is required';
    if (!formData.department?.trim()) newErrors.department = 'Department is required';

    // Role-specific validation
    if (userType === 'student') {
      if (!(formData as Student).studentId?.trim()) newErrors.studentId = 'Student ID is required';
    } else {
      if (!(formData as Teacher).teacherId?.trim()) newErrors.teacherId = 'Teacher ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const renderError = (field: string) => {
    return errors[field] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Add New {userType === 'student' ? 'Student' : 'Teacher'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          placeholder="Enter first name"
                        />
                        {renderError('firstName')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          placeholder="Enter last name"
                        />
                        {renderError('lastName')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          placeholder="Enter email address"
                        />
                        {renderError('email')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          placeholder="Enter password"
                        />
                        {renderError('password')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          placeholder="Enter address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic Information Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Academic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          School
                        </label>
                        <select
                          required
                          value={formData.school}
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            console.log('School selection changed:', selectedValue);
                            console.log('Available schools:', schools);
                            
                            // Find the selected school - convert both to strings for comparison
                            const selectedSchool = schools.find(s => String(s.id) === String(selectedValue));
                            console.log('Selected school data:', selectedSchool);
                            
                            setFormData({ 
                              ...formData, 
                              school: selectedValue,
                              department: '' // Reset department when school changes
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          disabled={loading}
                        >
                          <option value="">Select School</option>
                          {schools.map(school => (
                            <option key={school.id} value={school.id}>
                              {school.name} ({school.code})
                            </option>
                          ))}
                        </select>
                        {renderError('school')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <select
                          required
                          value={formData.department}
                          onChange={(e) => {
                            console.log('Department selected:', e.target.value);
                            setFormData({ ...formData, department: e.target.value });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          disabled={!formData.school || loading}
                        >
                          <option value="">Select Department</option>
                          {loading ? (
                            <option value="" disabled>Loading departments...</option>
                          ) : departments && departments.length > 0 ? (
                            departments.map(dept => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name} ({dept.code})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No departments available</option>
                          )}
                        </select>
                        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                        {renderError('department')}
                      </div>
                    </div>
                  </div>

                  {/* Role-specific Information Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">
                      {userType === 'student' ? 'Student Information' : 'Teacher Information'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {userType === 'student' ? 'Student ID' : 'Teacher ID'}
                        </label>
                        <input
                          type="text"
                          required
                          value={userType === 'student' ? (formData as Student).studentId : (formData as Teacher).teacherId}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            ...(userType === 'student' ? { studentId: e.target.value } : { teacherId: e.target.value })
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          placeholder={`Enter ${userType} ID`}
                        />
                        {renderError(userType === 'student' ? 'studentId' : 'teacherId')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Create {userType === 'student' ? 'Student' : 'Teacher'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateUserModal; 