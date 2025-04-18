import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  status: 'active' | 'inactive' | 'suspended';
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored authentication on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure token is in user object
        if (!parsedUser.token) {
          parsedUser.token = storedToken;
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await userService.login(email, password);
      console.log('Login response:', response); // Debug login response
      
      if (response.token && response.user) {
        // Add token to user object
        const userWithToken = {
          ...response.user,
          token: response.token
        };
        console.log('Setting user with token:', userWithToken); // Debug user object
        
        setUser(userWithToken);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        
        // Verify token was stored
        console.log('Stored token:', localStorage.getItem('token')); // Debug stored token
        
        // Redirect based on role
        switch (response.user.role) {
          case 'student':
            navigate('/dashboard/student');
            break;
          case 'teacher':
            navigate('/dashboard/teacher');
            break;
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'parent':
            navigate('/dashboard/parent');
            break;
          default:
            navigate('/');
        }
      } else {
        console.error('Login response missing token or user:', response); // Debug missing data
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error); // Debug login error
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 