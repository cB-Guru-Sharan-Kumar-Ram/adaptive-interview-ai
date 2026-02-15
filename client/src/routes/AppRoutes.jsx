import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import InterviewPage from '../pages/InterviewPage';
import VoiceInterviewPage from '../pages/VoiceInterviewPage';
import FeedbackPage from '../pages/FeedbackPage';
import HistoryPage from '../pages/HistoryPage';
import ResultsPage from '../pages/ResultsPage';

const AppRoutes = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />}
                />
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
                />
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <HistoryPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/results/:sessionId"
                    element={
                        <ProtectedRoute>
                            <ResultsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/interview"
                    element={
                        <ProtectedRoute>
                            <InterviewPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/voice-interview"
                    element={
                        <ProtectedRoute>
                            <VoiceInterviewPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/feedback"
                    element={
                        <ProtectedRoute>
                            <FeedbackPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
