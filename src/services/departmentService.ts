import { api } from './api';

export interface Department {
  id?: number;
  name: string;
  code: string;
  school_id: number;
  description?: string;
  status: 'active' | 'inactive';
  school_name?: string;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  school_id: number;
  description: string;
  status: 'active' | 'inactive';
}

export interface UpdateDepartmentData extends CreateDepartmentData {
  id: number;
}

class DepartmentService {
  async getAllDepartments(): Promise<Department[]> {
    try {
      const response = await api.get('/departments/index.php');
      return response.data;
    } catch (error) {
      console.error('Error in getAllDepartments:', error);
      if (error.response?.status === 401) {
        throw new Error('401');
      }
      throw error;
    }
  }

  async getDepartmentById(id: number): Promise<Department> {
    try {
      const response = await api.get(`/departments/index.php?id=${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch department');
    }
  }

  async createDepartment(department: CreateDepartmentData): Promise<Department> {
    try {
      const response = await api.post('/departments/index.php', {
        name: department.name,
        code: department.code,
        school_id: department.school_id,
        description: department.description || '',
        status: department.status || 'active'
      });
      return response.data;
    } catch (error) {
      console.error('Error in createDepartment:', error);
      if (error.response?.status === 401) {
        throw new Error('401');
      }
      throw error;
    }
  }

  async updateDepartment(department: Department): Promise<Department> {
    try {
      const response = await api.put(`/departments/index.php`, department);
      return response.data;
    } catch (error) {
      console.error('Error in updateDepartment:', error);
      if (error.response?.status === 401) {
        throw new Error('401');
      }
      throw error;
    }
  }

  async deleteDepartment(id: number): Promise<void> {
    try {
      await api.delete(`/departments/index.php`, { data: { id } });
    } catch (error) {
      console.error('Error in deleteDepartment:', error);
      if (error.response?.status === 401) {
        throw new Error('401');
      }
      throw error;
    }
  }
}

export const departmentService = new DepartmentService(); 
