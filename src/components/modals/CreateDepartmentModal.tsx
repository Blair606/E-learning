import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { departmentService, Department, CreateDepartmentData, UpdateDepartmentData } from '../../services/departmentService';
import { schoolService } from '../../services/schoolService';

export interface DepartmentFormData {
  id?: number;
  name: string;
  code: string;
  school_id: number;
  description: string;
  status: 'active' | 'inactive';
}

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData) => void;
  editData?: DepartmentFormData;
}

const CreateDepartmentModal = ({ isOpen, onClose, onSubmit, editData }: CreateDepartmentModalProps) => {
  const [formData, setFormData] = useState<DepartmentFormData>(
    editData || {
      name: '',
      code: '',
      school_id: 0,
      description: '',
      status: 'active'
    }
  );
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsData = await schoolService.getAllSchools();
        setSchools(schoolsData);
      } catch (err) {
        setError('Failed to load schools');
        console.error('Error loading schools:', err);
      }
    };
    fetchSchools();
  }, []);

  // Function to generate department code from name
  const generateDepartmentCode = (name: string): string => {
    if (!name.trim()) return '';
    
    // Split the name into words and filter out common words
    const words = name.toLowerCase().split(' ');
    const filteredWords = words.filter(word => 
      !['of', 'and', 'the', 'in', 'at', 'on', 'for', 'to'].includes(word)
    );
    
    // Take first letter of each word and join them
    const initials = filteredWords.map(word => word[0]).join('');
    
    // If we have more than 3 letters, take first 3
    // If we have less than 3 letters, pad with first letter
    let code = initials.length >= 3 
        ? initials.slice(0, 3).toUpperCase()
        : (initials + initials[0].repeat(3 - initials.length)).toUpperCase();

    // Add a random number to ensure uniqueness
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${code}${randomNum}`;
  };

  // Update code when name changes
  useEffect(() => {
    if (!editData && formData.name) {
      setFormData(prev => ({
        ...prev,
        code: generateDepartmentCode(prev.name)
      }));
    }
  }, [formData.name, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      onSubmit(formData);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error submitting department:', err);
    }
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  {editData ? 'Edit Department' : 'Create New Department'}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {error && (
                  <div className="mt-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Department Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                      placeholder="Enter department name"
                    />
                  </div>

                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Department Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                      placeholder="Enter department code"
                      readOnly={!editData}
                    />
                    {!editData && (
                      <p className="mt-1 text-sm text-gray-500">
                        Department code is automatically generated from the department name
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                      School
                    </label>
                    <select
                      id="school"
                      value={formData.school_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, school_id: Number(e.target.value) }))}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    >
                      <option value="">Select a school</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                      placeholder="Enter department description"
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      {editData ? 'Update' : 'Create'}
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

export default CreateDepartmentModal; 