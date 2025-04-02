import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserIcon, AcademicCapIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
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
    school_id: '',
    department_id: '',
    ...(userType === 'student' ? {
      grade: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      specialization: '',
      education: ''
    } : {
      specialization: '',
      education: '',
      experience: ''
    }),
    ...(editData || {})
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const schoolsData = await schoolService.getAllSchools();
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
      if (formData.school_id) {
        try {
          setLoading(true);
          const departmentsData = await schoolService.getDepartmentsBySchool(Number(formData.school_id));
          setDepartments(departmentsData);
          // Reset department selection when school changes
          setFormData(prev => ({ ...prev, department_id: '' }));
        } catch (err) {
          setError('Failed to load departments');
          console.error('Error loading departments:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setDepartments([]);
        setFormData(prev => ({ ...prev, department_id: '' }));
      }
    };
    fetchDepartments();
  }, [formData.school_id]);

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
        school_id: '',
        department_id: '',
        ...(userType === 'student' ? {
          grade: '',
          enrollmentDate: new Date().toISOString().split('T')[0],
          specialization: '',
          education: ''
        } : {
          specialization: '',
          education: '',
          experience: ''
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

    if (!formData.school_id) newErrors.school_id = 'School is required';
    if (!formData.department_id) newErrors.department_id = 'Department is required';

    // Role-specific validation
    if (userType === 'student') {
      if (!formData.grade?.trim()) newErrors.grade = 'Grade is required';
      if (!formData.enrollmentDate) newErrors.enrollmentDate = 'Enrollment date is required';
    } else {
      if (!formData.specialization?.trim()) newErrors.specialization = 'Specialization is required';
      if (!formData.education?.trim()) newErrors.education = 'Education is required';
      if (!formData.experience?.trim()) newErrors.experience = 'Experience is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
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
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    {userType === 'student' ? (
                      <AcademicCapIcon className="h-8 w-8 text-purple-500" />
                    ) : (
                      <UserIcon className="h-8 w-8 text-purple-500" />
                    )}
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-semibold leading-6 text-gray-900"
                    >
                      {editData ? 'Edit' : 'Add New'} {userType === 'student' ? 'Student' : 'Teacher'}
                    </Dialog.Title>
                  </div>
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
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-purple-500" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName || ''}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter first name"
                        />
                        {renderError('firstName')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName || ''}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter last name"
                        />
                        {renderError('lastName')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter email address"
                        />
                        {renderError('email')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.password || ''}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter password"
                        />
                        {renderError('password')}
                      </div>
                    </div>
                  </div>

                  {/* School and Department Section */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <BuildingLibraryIcon className="h-5 w-5 mr-2 text-purple-500" />
                      School Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          School
                        </label>
                        <select
                          value={formData.school_id || ''}
                          onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                          disabled={loading}
                        >
                          <option value="">Select a school</option>
                          {schools.map((school) => (
                            <option key={school.id} value={school.id}>
                              {school.name}
                            </option>
                          ))}
                        </select>
                        {renderError('school_id')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          value={formData.department_id || ''}
                          onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                          disabled={!formData.school_id || loading}
                        >
                          <option value="">Select a department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        {renderError('department_id')}
                      </div>
                    </div>
                  </div>

                  {/* Role-specific Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      {userType === 'student' ? (
                        <AcademicCapIcon className="h-5 w-5 mr-2 text-purple-500" />
                      ) : (
                        <UserIcon className="h-5 w-5 mr-2 text-purple-500" />
                      )}
                      {userType === 'student' ? 'Student Information' : 'Teacher Information'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userType === 'student' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Grade
                            </label>
                            <input
                              type="text"
                              value={(formData as Student).grade || ''}
                              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Enter grade"
                            />
                            {renderError('grade')}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Enrollment Date
                            </label>
                            <input
                              type="date"
                              value={(formData as Student).enrollmentDate || ''}
                              onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            {renderError('enrollmentDate')}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Specialization
                            </label>
                            <input
                              type="text"
                              value={(formData as Teacher).specialization || ''}
                              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Enter specialization"
                            />
                            {renderError('specialization')}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Experience
                            </label>
                            <input
                              type="text"
                              value={(formData as Teacher).experience || ''}
                              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Enter years of experience"
                            />
                            {renderError('experience')}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating...' : `Create ${userType === 'student' ? 'Student' : 'Teacher'}`}
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