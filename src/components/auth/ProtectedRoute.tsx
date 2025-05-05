import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!token || !user || !userRole) {
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(userRole.toLowerCase())) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 