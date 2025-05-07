import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface AddGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
}

interface GuardianFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  national_id: string;
}

const AddGuardianModal = ({ isOpen, onClose, studentId }: AddGuardianModalProps) => {
  const [formData, setFormData] = useState<GuardianFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    national_id: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost/E-learning/api/guardians/add.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          student_id: studentId,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        onClose();
        // You might want to add a success callback here
      } else {
        setError(data.message || 'Failed to add guardian');
      }
    } catch (err) {
      setError('Failed to add guardian. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-gray-100">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
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
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <UserPlusIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                      </div>
                      <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                        Add Guardian
                      </Dialog.Title>
                    </div>
                    <div className="mt-4">
                      {error && (
                        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
                          {error}
                        </div>
                      )}
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <div className="relative">
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="first_name"
                              id="first_name"
                              required
                              className="block w-full px-4 py-3 rounded-xl border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-all duration-200 ease-in-out sm:text-sm sm:leading-6"
                              placeholder="Enter first name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="relative">
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="last_name"
                              id="last_name"
                              required
                              className="block w-full px-4 py-3 rounded-xl border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-all duration-200 ease-in-out sm:text-sm sm:leading-6"
                              placeholder="Enter last name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="relative">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              required
                              className="block w-full px-4 py-3 rounded-xl border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-all duration-200 ease-in-out sm:text-sm sm:leading-6"
                              placeholder="guardian@example.com"
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="relative">
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phone_number"
                              id="phone_number"
                              required
                              className="block w-full px-4 py-3 rounded-xl border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-all duration-200 ease-in-out sm:text-sm sm:leading-6"
                              placeholder="+254 XXX XXX XXX"
                              value={formData.phone_number}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="relative">
                            <label htmlFor="national_id" className="block text-sm font-medium text-gray-700 mb-1">
                              National ID
                            </label>
                            <input
                              type="text"
                              name="national_id"
                              id="national_id"
                              required
                              className="block w-full px-4 py-3 rounded-xl border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-all duration-200 ease-in-out sm:text-sm sm:leading-6"
                              placeholder="Enter national ID number"
                              value={formData.national_id}
                              onChange={handleInputChange}
                            />
                            <p className="mt-2 text-sm text-gray-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              This will be used as the initial password for the guardian's account
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={loading}
                              className="inline-flex w-full sm:w-auto justify-center items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-400 transition-all duration-200 ease-in-out"
                            >
                              {loading ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Adding Guardian...
                                </>
                              ) : (
                                'Add Guardian'
                              )}
                            </button>
                            <button
                              type="button"
                              className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-200 ease-in-out"
                              onClick={onClose}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
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

export default AddGuardianModal;
