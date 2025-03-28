import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Student, Teacher } from '../../types/user';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<Student | Teacher>) => void;
  userType: 'student' | 'teacher';
}

const CreateUserModal = ({ isOpen, onClose, onSubmit, userType }: CreateUserModalProps) => {
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
      enrollmentDate: new Date().toISOString().split('T')[0]
    } : {
      teacherId: '',
      specialization: '',
      education: [{
        degree: '',
        institution: '',
        year: new Date().getFullYear()
      }]
    })
  });

  const [guardians, setGuardians] = useState<Student['guardians']>([]);
  const [guardian, setGuardian] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    occupation: '',
    nationalId: '',
  });

  const [qualifications, setQualifications] = useState<string[]>([]);
  const [qualification, setQualification] = useState('');

  const [subjects, setSubjects] = useState<string[]>([]);
  const [subject, setSubject] = useState('');

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
          enrollmentDate: new Date().toISOString().split('T')[0]
        } : {
          teacherId: '',
          specialization: '',
          education: [{
            degree: '',
            institution: '',
            year: new Date().getFullYear()
          }]
        })
      });
      setGuardians([]);
      setQualifications([]);
      setSubjects([]);
    }
  }, [isOpen, userType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = {
      ...formData,
      ...(userType === 'student' && {
        role: 'student' as const,
        studentId: `S${Math.floor(Math.random() * 10000)}`,
        guardians,
      }),
      ...(userType === 'teacher' && {
        role: 'teacher' as const,
        employeeId: `T${Math.floor(Math.random() * 10000)}`,
        qualifications,
        subjects,
        yearsOfExperience: Number(formData.yearsOfExperience || 0),
      }),
    };
    onSubmit(userData);
    onClose();
  };

  const addGuardian = () => {
    if (guardian.name && guardian.relationship) {
      setGuardians([...guardians, guardian]);
      setGuardian({
        name: '',
        relationship: '',
        phone: '',
        email: '',
        occupation: '',
        nationalId: '',
      });
    }
  };

  const removeGuardian = (index: number) => {
    setGuardians(guardians.filter((_, i) => i !== index));
  };

  const addQualification = () => {
    if (qualification && !qualifications.includes(qualification)) {
      setQualifications([...qualifications, qualification]);
      setQualification('');
    }
  };

  const removeQualification = (qual: string) => {
    setQualifications(qualifications.filter((q) => q !== qual));
  };

  const addSubject = () => {
    if (subject && !subjects.includes(subject)) {
      setSubjects([...subjects, subject]);
      setSubject('');
    }
  };

  const removeSubject = (sub: string) => {
    setSubjects(subjects.filter((s) => s !== sub));
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Add New {userType === 'student' ? 'Student' : 'Teacher'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Information */}
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
                      />
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
                      />
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
                      />
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
                      />
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        School
                      </label>
                      <select
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      >
                        <option value="">Select School</option>
                        <option value="SASA">SASA</option>
                        <option value="SBE">SBE</option>
                        <option value="SED">SED</option>
                        <option value="SEES">SEES</option>
                        <option value="SHHS">SHHS</option>
                        <option value="HSSS">HSSS</option>
                        <option value="SPAS">SPAS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Role-specific fields */}
                  {userType === 'student' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Student ID
                        </label>
                        <input
                          type="text"
                          required
                          value={(formData as Student).studentId}
                          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Grade
                        </label>
                        <input
                          type="text"
                          value={(formData as Student).grade}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Enrollment Date
                        </label>
                        <input
                          type="date"
                          value={(formData as Student).enrollmentDate}
                          onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Teacher ID
                        </label>
                        <input
                          type="text"
                          required
                          value={(formData as Teacher).teacherId}
                          onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Specialization
                        </label>
                        <input
                          type="text"
                          value={(formData as Teacher).specialization}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Education
                        </label>
                        {(formData as Teacher).education?.map((edu, index) => (
                          <div key={index} className="space-y-2">
                            <input
                              type="text"
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => {
                                const newEducation = [...(formData as Teacher).education || []];
                                newEducation[index] = { ...edu, degree: e.target.value };
                                setFormData({ ...formData, education: newEducation });
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={(e) => {
                                const newEducation = [...(formData as Teacher).education || []];
                                newEducation[index] = { ...edu, institution: e.target.value };
                                setFormData({ ...formData, education: newEducation });
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Year"
                              value={edu.year}
                              onChange={(e) => {
                                const newEducation = [...(formData as Teacher).education || []];
                                newEducation[index] = { ...edu, year: parseInt(e.target.value) };
                                setFormData({ ...formData, education: newEducation });
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              education: [
                                ...(formData as Teacher).education || [],
                                { degree: '', institution: '', year: new Date().getFullYear() }
                              ]
                            });
                          }}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Education
                        </button>
                      </div>
                    </div>
                  )}

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