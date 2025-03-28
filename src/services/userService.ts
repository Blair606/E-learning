import { User } from '../types/user';

const API_URL = 'http://localhost/E-learning/api';

interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
}

interface ApiError {
    error: string;
}

class UserService {
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Network error occurred' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await fetch(`${API_URL}/auth/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
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
            const response = await fetch(`${API_URL}/auth/register.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }
            
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
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        try {
            const response = await fetch(`${API_URL}/users/index.php`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            return this.handleResponse<User[]>(response);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to fetch users');
        }
    }

    async updateUserStatus(userId: string, status: string): Promise<User> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        try {
            const response = await fetch(`${API_URL}/users/update_status.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ userId, status })
            });
            return this.handleResponse<User>(response);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to update user status');
        }
    }

    async logout(): Promise<void> {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

export const userService = new UserService(); 