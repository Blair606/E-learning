import axios from 'axios';
import { User } from '../types/user';

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

  async register(userData: Partial<User>) {
    try {
      const response = await axios.post<ApiResponse<User>>(`${API_URL}/auth/register.php`, userData);
      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiErrorResponse;
        throw new Error(errorResponse?.error || 'Registration failed');
      }
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

  async createUser(userData: Partial<User>) {
    try {
      const response = await axios.post<ApiResponse<User>>(`${API_URL}/users.php`, userData, {
        headers: this.getHeaders(),
      });
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create user');
      }
      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiErrorResponse;
        throw new Error(errorResponse?.error || 'Failed to create user');
      }
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>) {
    try {
      const response = await axios.put<ApiResponse<User>>(`${API_URL}/users.php/${userId}`, userData, {
        headers: this.getHeaders(),
      });
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update user');
      }
      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiErrorResponse;
        throw new Error(errorResponse?.error || 'Failed to update user');
      }
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const response = await axios.delete<ApiResponse<void>>(`${API_URL}/users.php/${userId}`, {
        headers: this.getHeaders(),
      });
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete user');
      }
      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiErrorResponse;
        throw new Error(errorResponse?.error || 'Failed to delete user');
      }
      throw error;
    }
  }

  isAxiosError(error: unknown): error is import('axios').AxiosError {
    return (error as import('axios').AxiosError).isAxiosError === true;
  }
}

export const userService = new UserService(); 