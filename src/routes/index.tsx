import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import StudentSignIn from '../components/auth/StudentSignIn';
import TeacherSignIn from '../components/auth/TeacherSignIn';
import ParentSignIn from '../components/auth/ParentSignIn';
import AdminSignIn from '../components/auth/AdminSignIn';
import StudentSignUp from '../components/auth/StudentSignUp';
import TeacherSignUp from '../components/auth/TeacherSignUp';
import AdminSignUp from '../components/auth/AdminSignUp';
import Unauthorized from '../components/auth/Unauthorized';
import StudentDashboard from '../pages/dashboards/StudentDashboard';
import TeacherDashboard from '../pages/dashboards/TeacherDashboard';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import ParentDashboard from '../pages/dashboards/ParentDashboard';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Landing page */}
            <Route path="/" element={<HomePage />} />

            {/* Public routes */}
            <Route path="/login" element={<Navigate to="/login/student" replace />} />
            <Route path="/login/admin" element={<AdminSignIn />} />
            <Route path="/login/teacher" element={<TeacherSignIn />} />
            <Route path="/login/student" element={<StudentSignIn />} />
            <Route path="/login/parent" element={<ParentSignIn />} />
            
            <Route path="/signup" element={<Navigate to="/signup/student" replace />} />
            <Route path="/signup/admin" element={<AdminSignUp />} />
            <Route path="/signup/teacher" element={<TeacherSignUp />} />
            <Route path="/signup/student" element={<StudentSignUp />} />
            
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes */}
            <Route
                path="/dashboard/student"
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/teacher"
                element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                        <TeacherDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/parent"
                element={
                    <ProtectedRoute allowedRoles={['parent']}>
                        <ParentDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes; 