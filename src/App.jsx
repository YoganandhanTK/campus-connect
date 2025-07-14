import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import FacultyDashboard from './pages/faculty/FacultyDashboard.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';

import NoticeBoard from './pages/admin/NoticeBoard.jsx';
import ManageFaculty from './pages/admin/ManageFaculty.jsx';
import StudentApprovals from './pages/faculty/StudentApprovals.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import UserProfile from './pages/admin/UserProfile.jsx';
import ManagedStudents from './components/ManageStudents.jsx';

const App = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole')?.toLowerCase();

    return (
        <Router>
            <Routes>

                {/* Public routes */}
                <Route path="/" element={!token ? <LandingPage /> : <Navigate to={`/${role}/dashboard`} />} />
                <Route path="/login" element={!token ? <Login /> : <Navigate to={`/${role}/dashboard`} />} />
                <Route path="/register" element={!token ? <Register /> : <Navigate to={`/${role}/dashboard`} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                

                {/* Admin layout wrapper */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="noticeboard" element={<NoticeBoard />} />
                    <Route path="managestudents" element={<ManagedStudents />} />
                    <Route path="managefaculty" element={<ManageFaculty />} />
                    <Route path="profile" element={<UserProfile />} />
                </Route>


                <Route
                    path="/faculty"
                    element={
                        <ProtectedRoute allowedRoles={['faculty']}>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<FacultyDashboard />} />
                    <Route path="student-approvals" element={<StudentApprovals />} />
                    <Route path="noticeboard" element={<NoticeBoard />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="managestudents" element={<ManagedStudents />} />
                </Route>












                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback routes */}
                <Route path="/unauthorized" element={<h2>Unauthorized Access</h2>} />
                <Route path="*" element={<h2>404 - Page Not Found</h2>} />
            </Routes>
        </Router>
    );
};

export default App;
