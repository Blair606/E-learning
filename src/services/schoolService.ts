import api from '../config/api';

export interface School {
    id: number;
    name: string;
    code: string;
    description: string;
    status: 'active' | 'inactive';
    departments: string[];
    created_at: string;
    updated_at: string;
}

export interface Department {
    id: number;
    name: string;
    code: string;
    school_id: number;
    description: string;
    status: 'active' | 'inactive';
    school_name: string;
}

export interface CreateSchoolData {
    name: string;
    code: string;
    description?: string;
    status?: 'active' | 'inactive';
    departments?: string[];
}

export interface UpdateSchoolData extends CreateSchoolData {
    id: number;
}

export interface ApiError {
    message: string;
}

class SchoolService {
    async getAllSchools(): Promise<School[]> {
        try {
            const response = await api.get('/schools/index.php');
            return response.data;
        } catch (error) {
            console.error('Error fetching schools:', error);
            throw error;
        }
    }

    async getSchoolById(id: number): Promise<School> {
        try {
            const response = await api.get(`/schools/index.php?id=${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching school:', error);
            throw error;
        }
    }

    async createSchool(data: CreateSchoolData): Promise<{ id: number; message: string }> {
        try {
            const response = await api.post('/schools/index.php', data);
            return response.data;
        } catch (error) {
            console.error('Error creating school:', error);
            throw error;
        }
    }

    async updateSchool(data: UpdateSchoolData): Promise<{ message: string }> {
        try {
            const response = await api.put('/schools/index.php', data);
            return response.data;
        } catch (error) {
            console.error('Error updating school:', error);
            throw error;
        }
    }

    async deleteSchool(id: number): Promise<{ message: string }> {
        try {
            const response = await api.delete('/schools/index.php', { data: { id } });
            return response.data;
        } catch (error) {
            console.error('Error deleting school:', error);
            throw error;
        }
    }

    async getDepartmentsBySchool(schoolId: number): Promise<Department[]> {
        try {
            const response = await api.get(`/departments/index.php?school_id=${schoolId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching departments:', error);
            throw error;
        }
    }
}

export const schoolService = new SchoolService(); 