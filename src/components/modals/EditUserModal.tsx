import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../../types/user';
import { schoolService, School, Department } from '../../services/schoolService';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userData: Partial<User>) => void;
}

interface UserFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  school_id?: string;
  department_id?: string;
}

const EditUserModal = ({ isOpen, onClose, user, onSave }: EditUserModalProps) => {
  const [formData, setFormData] = useState<UserFormData>({});
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (user) {
      const { firstName, lastName, email, school_id, department_id } = user as any;
      setFormData({ firstName, lastName, email, school_id, department_id });
    }
  }, [user]);

  useEffect(() => {
    // Fetch schools on mount
    const fetchSchools = async () => {
      try {
        const schools = await schoolService.getAllSchools();
        setSchools(schools);
      } catch (err) {
        setSchools([]);
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    // Fetch departments when school changes
    const fetchDepartments = async () => {
      if (formData.school_id) {
        try {
          const departments = await schoolService.getDepartmentsBySchool(Number(formData.school_id));
          setDepartments(Array.isArray(departments) ? departments : []);
        } catch (err) {
          setDepartments([]);
        }
      } else {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, [formData.school_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">School</label>
              <select
                value={formData.school_id || ''}
                onChange={e => setFormData({ ...formData, school_id: e.target.value, department_id: '' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.department_id || ''}
                onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                required={!!formData.school_id}
                disabled={!formData.school_id}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditUserModal;