import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import UserDashboard from './components/UserDashboard';
import ProjectManagement from './components/ProjectManagement';
import ProtectedRoute from './components/ProtectedRoutes';
import TaskPage from './components/TaskPage';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AdminPortal from './components/AdminPortal';
import ProfilePage from './components/Profile';


const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/project/:projectId"
                        element={
                            <ProtectedRoute>
                                <ProjectManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/task/:taskId"
                        element={
                            <ProtectedRoute>
                                <TaskPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/adminportal"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <AdminPortal />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<AuthPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;