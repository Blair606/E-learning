import axios from 'axios';

// Base URL for XAMPP backend
const BASE_URL = 'http://localhost/E-learning/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true // Enable sending cookies with requests
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

export default api;

// API Configuration
export const API_URL = 'http://localhost/E-learning/api';

// API Endpoints
export const API_ENDPOINTS = {
    auth: `${API_URL}/auth`,
    users: `${API_URL}/users`,
    schools: `${API_URL}/schools`,
    departments: `${API_URL}/departments`,
} as const;

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// API Error Types
export interface ApiError {
    message: string;
    code?: string;
    details?: any;
} 