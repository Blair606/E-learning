import api from '../config/api';
import { User } from '../types/user';

interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
}

interface ApiError {
    error: string;
}

class UserService {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await api.post('/auth/login.php', { email, password });
            const data = response.data;
            
            if (!data.success) {
                throw new Error(data.error || 'Login failed');
            }
            
            if (!data.token || !data.user) {
                throw new Error('Invalid response format from server');
            }
            
            return {
                success: true,
                token: data.token,
                user: data.user
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('An unexpected error occurred during login');
        }
    }

    async createUser(userData: Omit<User, 'id'> & { password: string }): Promise<User> {
        try {
            const response = await api.post('/auth/register.php', userData);
            const data = response.data;
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to create user');
            }
            
            return data.user;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('An unexpected error occurred during registration');
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const response = await api.get('/users/index.php');
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to fetch users');
        }
    }

    async updateUserStatus(userId: string, status: string): Promise<User> {
        try {
            const response = await api.post('/users/update_status.php', { userId, status });
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to update user status');
        }
    }

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout.php');
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
}

export const userService = new UserService(); 