import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface SchoolFormData {
  name: string;
  code: string;
  description: string;
  status: "active" | "inactive";
  departments: string[];
}

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SchoolFormData) => void;
  editData?: SchoolFormData;
}

const CreateSchoolModal: React.FC<CreateSchoolModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
}) => {
  const [formData, setFormData] = useState<SchoolFormData>(
    editData || {
      name: "",
      code: "",
      description: "",
      status: "active",
      departments: [],
    }
  );
  const [newDepartment, setNewDepartment] = useState("");

  // Function to generate school code from name
  const generateSchoolCode = (name: string): string => {
    if (!name.trim()) return "";
    
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
        code: generateSchoolCode(prev.name)
      }));
    }
  }, [formData.name, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure departments are not empty strings
    const validDepartments = formData.departments.filter(dept => dept.trim() !== '');
    onSubmit({
        ...formData,
        departments: validDepartments
    });
  };

  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      setFormData((prev) => ({
        ...prev,
        departments: [...prev.departments, newDepartment.trim()],
      }));
      setNewDepartment("");
    }
  };

  const handleRemoveDepartment = (department: string) => {
    setFormData((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d !== department),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editData ? "Edit School" : "Create New School"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              School Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              School Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, code: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
              readOnly={!editData}
            />
            {!editData && (
              <p className="mt-1 text-sm text-gray-500">
                School code is automatically generated from the school name
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as "active" | "inactive",
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Departments
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Add a department"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddDepartment}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.departments.map((dept) => (
                <span
                  key={dept}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {dept}
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(dept)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {editData ? "Update School" : "Create School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSchoolModal; 