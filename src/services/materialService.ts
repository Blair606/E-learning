import { API_BASE_URL } from '../config';

export interface ClassMaterial {
  id: number;
  class_id: number;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  uploader_id: number;
  material_type: 'file' | 'link';
  created_at: string;
  updated_at: string;
}

export const getMaterialsByClassId = async (classId: number): Promise<ClassMaterial[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/materials/get_by_class.php?class_id=${classId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch class materials');
    }

    const data = await response.json();
    if (data.status === 'success') {
      return data.materials;
    }
    
    throw new Error(data.message || 'Failed to fetch class materials');
  } catch (error) {
    console.error('Error fetching class materials:', error);
    throw error;
  }
};

export const downloadMaterial = async (materialId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/materials/download.php?id=${materialId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download material');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading material:', error);
    throw error;
  }
};
