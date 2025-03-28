import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import { userService } from '../../services/userService';
import { UserCircleIcon, LockClosedIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface SignInError {
    message: string;
}

interface LocationState {
    from?: {
        pathname: string;
    };
}

const ParentSignIn: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await userService.login(formData.email, formData.password);
            if (response.token && response.user.role === 'parent') {
                dispatch(setUser(response.user));
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                const from = (location.state as LocationState)?.from?.pathname || '/dashboard/parent';
                navigate(from);
            } else {
                setError('This account is not registered as a parent');
            }
        } catch (err) {
            const error = err as SignInError;
            setError(error.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between">
                <div className="text-white">
                    <div className="flex items-center space-x-3 mb-8">
                        <AcademicCapIcon className="h-12 w-12" />
                        <h1 className="text-3xl font-bold">E-Learning Portal</h1>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">Welcome to Parent Portal</h2>
                    <p className="text-xl text-blue-100">Access your child's academic progress, attendance, and more in one place.</p>
                </div>
                <div className="text-white/80">
                    <p className="text-sm">© 2024 E-Learning Portal. All rights reserved.</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="flex items-center space-x-3">
                            <AcademicCapIcon className="h-12 w-12 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">E-Learning Portal</h1>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-xl">
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 transform hover:scale-105 transition-transform duration-200">
                                <UserCircleIcon className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Parent Sign In</h2>
                            <p className="text-gray-600">Access your child's academic information</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <div className="mt-1 relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserCircleIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1 relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] ${
                                        loading ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have a parent account?{' '}
                                <a href="/signup/parent" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                                    Sign up
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentSignIn; 