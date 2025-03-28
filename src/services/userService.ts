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
        const data = await response.json();
        console.log('API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: data
        });
        
        if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
        }
        
        return data;
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            console.log('Attempting login with:', { email });
            const response = await fetch(`${API_URL}/auth/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Login response:', {
                status: response.status,
                data: data
            });
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Login failed');
            }
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async createUser(userData: Omit<User, 'id'> & { password: string }): Promise<User> {
        try {
            console.log('Attempting to create user:', { ...userData, password: '[REDACTED]' });
            const response = await fetch(`${API_URL}/auth/register.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            console.log('Registration response:', {
                status: response.status,
                data: data
            });
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to create user');
            }
            
            return data.user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async getAllUsers(): Promise<User[]> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/users/get_all.php`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
        });
        return this.handleResponse<User[]>(response);
    }

    async updateUserStatus(userId: string, status: string): Promise<User> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/users/update_status.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ userId, status }),
        });
        return this.handleResponse<User>(response);
    }

    async logout(): Promise<void> {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

export const userService = new UserService(); 