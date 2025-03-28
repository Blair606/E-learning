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
    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            throw new Error('No authentication token found');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error: ApiError = await response.json();
            console.error('API Error:', error);
            throw new Error(error.message || 'An error occurred');
        }
        return response.json();
    }

    async getAllSchools(): Promise<School[]> {
        try {
            const response = await fetch(`${api.defaults.baseURL}/schools/index.php`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse<School[]>(response);
        } catch (error) {
            console.error('Error fetching schools:', error);
            throw error;
        }
    }

    async getSchoolById(id: number): Promise<School> {
        try {
            const response = await fetch(`${api.defaults.baseURL}/schools/index.php?id=${id}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse<School>(response);
        } catch (error) {
            console.error('Error fetching school:', error);
            throw error;
        }
    }

    async createSchool(data: CreateSchoolData): Promise<{ id: number; message: string }> {
        try {
            console.log('Creating school with data:', data);
            console.log('API URL:', `${api.defaults.baseURL}/schools/index.php`);
            console.log('Headers:', this.getHeaders());

            const response = await fetch(`${api.defaults.baseURL}/schools/index.php`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to create school');
            }

            return responseData;
        } catch (error) {
            console.error('Error creating school:', error);
            throw error;
        }
    }

    async updateSchool(data: UpdateSchoolData): Promise<{ message: string }> {
        try {
            const response = await fetch(`${api.defaults.baseURL}/schools/index.php`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return this.handleResponse<{ message: string }>(response);
        } catch (error) {
            console.error('Error updating school:', error);
            throw error;
        }
    }

    async deleteSchool(id: number): Promise<{ message: string }> {
        try {
            const response = await fetch(`${api.defaults.baseURL}/schools/index.php`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                body: JSON.stringify({ id })
            });
            return this.handleResponse<{ message: string }>(response);
        } catch (error) {
            console.error('Error deleting school:', error);
            throw error;
        }
    }
}

export const schoolService = new SchoolService(); 