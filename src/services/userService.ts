import api from '../config/api';
import { User, Student, Teacher, Parent } from '../types/user';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
}

class UserService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    // Store token in localStorage for persistence
    localStorage.setItem('token', token);
  }

  constructor() {
    // Initialize token from localStorage
    this.token = localStorage.getItem('token');
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login.php', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  async register(userData: Partial<User>): Promise<User> {
    try {
      // Log the request data
      console.log('Sending registration request with data:', userData);
      
      const response = await api.post('/auth/register.php', userData);
      
      // Log the full response for debugging
      console.log('Full registration response:', response);
      console.log('Response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Registration failed');
      }
      
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      if (this.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users/index.php');
      
      // Log the raw response for debugging
      console.log('Raw API response:', response.data);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        return response.data.users;
      } else if (response.data && typeof response.data === 'object') {
        // Try to find any array property in the response
        const arrayProperty = Object.values(response.data).find(value => Array.isArray(value));
        if (arrayProperty) {
          return arrayProperty;
        }
      }
      
      console.error('Unexpected response format:', response.data);
      throw new Error('Invalid response format from users API');
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      if (this.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Unauthorized access');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
      throw error;
    }
  }

  async getTeachersByDepartment(departmentId: number) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Fetching teachers for department:', departmentId);
      const response = await api.get<ApiResponse<User[]>>(`/teachers/department/index.php?id=${departmentId}`, {
        headers: this.getHeaders(),
      });

      console.log('Response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch teachers');
      }

      return response.data;
    } catch (error) {
      console.error('Error details:', error);
      if (this.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        const errorResponse = error.response?.data as ApiErrorResponse;
        throw new Error(errorResponse?.error || `Failed to fetch teachers: ${error.message}`);
      }
      throw error;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.post('/users/index.php', userData);
      return response.data;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put(`/users/index.php?id=${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await api.delete(`/users/index.php?id=${userId}`);
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getStudents(): Promise<Student[]> {
    try {
      const response = await api.get('/users/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getTeachers(): Promise<Teacher[]> {
    try {
      const response = await api.get('/users/teachers');
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  }

  async getParents(): Promise<Parent[]> {
    try {
      const response = await api.get('/users/parents');
      return response.data;
    } catch (error) {
      console.error('Error fetching parents:', error);
      throw error;
    }
  }

  async updateProfile(userId: number, data: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put(`/users/profile.php?id=${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  async getProfile(userId: number): Promise<User> {
    try {
      const response = await api.get(`/users/profile.php?id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  }

  isAxiosError(error: unknown): error is import('axios').AxiosError {
    return (error as import('axios').AxiosError).isAxiosError === true;
  }
}

export const userService = new UserService(); 