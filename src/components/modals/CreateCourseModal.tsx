import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { schoolService, School, Department } from '../../services/schoolService';
import { userService } from '../../services/userService';
import { User } from '../../types/user';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: CourseFormData) => void;
  editData?: CourseFormData;
}

export interface CourseFormData {
  id?: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  school_id: number;
  department_id: number;
  instructor_id: number;
  status: 'active' | 'inactive';
  enrollment_capacity: number;
  start_date: string;
  end_date: string;
  schedule: {
    day: string;
    time: string;
    duration: number;
  }[];
  prerequisites: string[];
}

const CreateCourseModal = ({ isOpen, onClose, onSubmit, editData }: CourseModalProps) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    code: '',
    title: '',
    description: '',
    credits: 3,
    school_id: 0,
    department_id: 0,
    instructor_id: 0,
    status: 'active',
    enrollment_capacity: 30,
    start_date: '',
    end_date: '',
    schedule: [{ day: 'Monday', time: '09:00', duration: 60 }],
    prerequisites: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolsData = await schoolService.getAllSchools();
        setSchools(schoolsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) {
      fetchData();
      if (editData) {
        setFormData(editData);
        setSelectedSchool(editData.school_id);
        if (editData.school_id) {
          fetchDepartments(editData.school_id);
        }
      }
    }
  }, [isOpen, editData]);

  const fetchDepartments = async (schoolId: number) => {
    try {
      const departmentsData = await schoolService.getDepartmentsBySchool(schoolId);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTeachers = async (departmentId: number) => {
    try {
      const teachersData = await userService.getTeachersByDepartment(departmentId);
      console.log('Fetched teachers data:', teachersData);
      if (teachersData.success && teachersData.data) {
        setInstructors(teachersData.data);
        console.log('Set instructors:', teachersData.data);
      } else {
        console.error('No teachers data received:', teachersData);
        setInstructors([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setInstructors([]);
    }
  };

  const generateCourseCode = (schoolCode: string, departmentCode: string) => {
    const timestamp = Date.now().toString().slice(-4);
    return `${schoolCode}${departmentCode}${timestamp}`;
  };

  const handleSchoolChange = (schoolId: number) => {
    setSelectedSchool(schoolId);
    setFormData(prev => ({ ...prev, school_id: schoolId, department_id: 0 }));
    fetchDepartments(schoolId);
  };

  const handleDepartmentChange = (departmentId: number) => {
    const department = departments.find(d => d.id === departmentId);
    const school = schools.find(s => s.id === selectedSchool);
    
    if (department && school) {
      const courseCode = generateCourseCode(school.code, department.code);
      setFormData(prev => ({
        ...prev,
        department_id: departmentId,
        code: courseCode,
        instructor_id: 0 // Reset instructor selection when department changes
      }));
      console.log('Fetching teachers for department:', departmentId);
      fetchTeachers(departmentId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: 'Monday', time: '09:00', duration: 60 }]
    }));
  };

  const removeScheduleSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const updateScheduleSlot = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const addPrerequisite = () => {
    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, '']
    }));
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const updatePrerequisite = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.map((prereq, i) => 
        i === index ? value : prereq
      )
    }));
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      {editData ? 'Edit Course' : 'Create New Course'}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        {/* School Selection */}
                        <div>
                          <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                            School*
                          </label>
                          <select
                            id="school"
                            required
                            value={formData.school_id}
                            onChange={(e) => handleSchoolChange(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                          >
                            <option value="">Select School</option>
                            {schools.map((school) => (
                              <option key={school.id} value={school.id}>
                                {school.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Department Selection */}
                        <div>
                          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                            Department*
                          </label>
                          <select
                            id="department"
                            required
                            value={formData.department_id}
                            onChange={(e) => handleDepartmentChange(Number(e.target.value))}
                            disabled={!selectedSchool}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Course Code */}
                        <div>
                          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Course Code*
                          </label>
                          <input
                            type="text"
                            id="code"
                            required
                            value={formData.code}
                            readOnly
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                          />
                        </div>

                        {/* Course Title */}
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Course Title*
                          </label>
                          <input
                            type="text"
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        {/* Credits */}
                        <div>
                          <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                            Credits*
                          </label>
                          <input
                            type="number"
                            id="credits"
                            required
                            min="1"
                            max="6"
                            value={formData.credits}
                            onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        {/* Instructor */}
                        <div>
                          <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">
                            Instructor*
                          </label>
                          <select
                            id="instructor"
                            required
                            value={formData.instructor_id}
                            onChange={(e) => setFormData({ ...formData, instructor_id: Number(e.target.value) })}
                            disabled={!formData.department_id}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
                          >
                            <option value="">Select Instructor</option>
                            {instructors && instructors.length > 0 ? (
                              instructors.map((instructor) => (
                                <option key={instructor.id} value={instructor.id}>
                                  {instructor.first_name} {instructor.last_name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>No instructors available</option>
                            )}
                          </select>
                        </div>

                        {/* Status */}
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status*
                          </label>
                          <select
                            id="status"
                            required
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>

                        {/* Enrollment Capacity */}
                        <div>
                          <label htmlFor="enrollmentCapacity" className="block text-sm font-medium text-gray-700">
                            Enrollment Capacity*
                          </label>
                          <input
                            type="number"
                            id="enrollmentCapacity"
                            required
                            min="1"
                            value={formData.enrollment_capacity}
                            onChange={(e) => setFormData({ ...formData, enrollment_capacity: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        {/* Start Date */}
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                            Start Date*
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            required
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        {/* End Date */}
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                            End Date*
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            required
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description*
                        </label>
                        <textarea
                          id="description"
                          required
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      {/* Schedule */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Schedule*
                          </label>
                          <button
                            type="button"
                            onClick={addScheduleSlot}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Slot
                          </button>
                        </div>
                        <div className="space-y-4">
                          {formData.schedule.map((slot, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <select
                                value={slot.day}
                                onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                              >
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                              </select>
                              <input
                                type="time"
                                value={slot.time}
                                onChange={(e) => updateScheduleSlot(index, 'time', e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                              />
                              <input
                                type="number"
                                value={slot.duration}
                                onChange={(e) => updateScheduleSlot(index, 'duration', Number(e.target.value))}
                                min="30"
                                max="180"
                                step="30"
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => removeScheduleSlot(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prerequisites */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Prerequisites
                          </label>
                          <button
                            type="button"
                            onClick={addPrerequisite}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Prerequisite
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.prerequisites.map((prereq, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={prereq}
                                onChange={(e) => updatePrerequisite(index, e.target.value)}
                                placeholder="Enter prerequisite course code"
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => removePrerequisite(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                        >
                          {editData ? 'Update Course' : 'Create Course'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CreateCourseModal; 