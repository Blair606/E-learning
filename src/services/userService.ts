import axios from 'axios';
import { User, Student, Teacher, Parent } from '../types/user';

const API_URL = 'http://localhost/E-learning/api';

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

  async login(email: string, password: string) {
    try {
      const response = await axios.post<ApiResponse<{ token: string; user: User }>>(`${API_URL}/auth/login.php`, {
        email,
        password,
      });
      if (response.data.success && response.data.data?.token) {
        this.setToken(response.data.data.token);
      }
      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiErrorResponse;
        throw new Error(errorResponse?.error || 'Login failed');
      }
      throw error;
    }
  }

  async register(userData: Partial<User>): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/auth/register.php`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await axios.get<ApiResponse<User[]>>(`${API_URL}/users.php`, {
        headers: this.getHeaders(),
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch users');
      }

      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        const errorResponse = error.response?.data as ApiErrorResponse;
        throw new Error(errorResponse?.error || 'Failed to fetch users');
      }
      throw error;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await axios.post<ApiResponse<User>>(`${API_URL}/users/create.php`, userData, {
        headers: this.getHeaders()
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create user');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('User creation error:', error);
      if (this.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiErrorResponse;
        throw new Error(errorResponse?.error || 'Failed to create user');
      }
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('User update error:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/users/${userId}`);
    } catch (error) {
      console.error('User deletion error:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getStudents(): Promise<Student[]> {
    try {
      const response = await axios.get(`${API_URL}/users/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getTeachers(): Promise<Teacher[]> {
    try {
      const response = await axios.get(`${API_URL}/users/teachers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  }

  async getParents(): Promise<Parent[]> {
    try {
      const response = await axios.get(`${API_URL}/users/parents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching parents:', error);
      throw error;
    }
  }

  isAxiosError(error: unknown): error is import('axios').AxiosError {
    return (error as import('axios').AxiosError).isAxiosError === true;
  }
}

export const userService = new UserService(); 