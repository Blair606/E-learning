import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'

import StudentDashboard from './pages/dashboards/StudentDashboard'
import TeacherDashboard from './pages/dashboards/TeacherDashboard'
import ParentDashboard from './pages/dashboards/ParentDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import { Provider } from 'react-redux'
import { store } from './store/store'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import SignUpPage from './pages/SignUpPage'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    // <AuthProvider>
      <Provider store={store}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/dashboard/student" 
              element={
                // <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                // </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/teacher" 
              element={
                // <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                // </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/parent" 
              element={
                // <ProtectedRoute requiredRole="parent">
                  <ParentDashboard />
                // </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                // <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                // </ProtectedRoute>
              } 
            />
            <Route path='/signin' element={<Login /> } />
            <Route path='/signup' element={<SignUpPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </Provider>
    // </AuthProvider>
  )
}

export default App
