import React, { useState } from 'react';
import { XMarkIcon, DocumentIcon, LinkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface UploadClassMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  onMaterialUploaded: () => void;
}

const UploadClassMaterialModal: React.FC<UploadClassMaterialModalProps> = ({
  isOpen,
  onClose,
  classId,
  onMaterialUploaded
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'file', // or 'link'
    file: null as File | null,
    fileUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.type === 'file' && !formData.file) {
        throw new Error('Please select a file to upload');
      }

      if (formData.type === 'link' && !formData.fileUrl) {
        throw new Error('Please provide a link');
      }

      // If it's a file upload, first upload the file
      let fileUrl = formData.fileUrl;
      if (formData.type === 'file' && formData.file) {
        const formDataFile = new FormData();
        formDataFile.append('file', formData.file);
        
        const uploadResponse = await axios.post(
          'http://localhost/E-learning/api/upload.php',
          formDataFile,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (!uploadResponse.data.success) {
          throw new Error(uploadResponse.data.message || 'Failed to upload file');
        }

        fileUrl = uploadResponse.data.file_url;
      }

      // Then save the material information
      const response = await axios.post(
        'http://localhost/E-learning/api/teachers/class_materials.php',
        {
          class_id: classId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          file_url: fileUrl,
          file_type: formData.file?.type || null,
          file_size: formData.file?.size || null
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        onMaterialUploaded();
        onClose();
        setFormData({
          title: '',
          description: '',
          type: 'file',
          file: null,
          fileUrl: ''
        });
      } else {
        setError(response.data.message || 'Failed to upload material');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-semibold text-gray-900">Upload Class Material</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter material title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter material description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={formData.type === 'file'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    <DocumentIcon className="w-5 h-5 mr-2" />
                    File Upload
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="link"
                    checked={formData.type === 'link'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    <LinkIcon className="w-5 h-5 mr-2" />
                    External Link
                  </span>
                </label>
              </div>
            </div>

            {formData.type === 'file' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Link
                </label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="https://..."
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadClassMaterialModal; 