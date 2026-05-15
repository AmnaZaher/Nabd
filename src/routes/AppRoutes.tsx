import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { PATHS } from './routePaths';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../pages/auth/LoginForm';
import ForgotPasswordForm from '../pages/auth/ForgotPasswordForm';
import OtpVerificationForm from '../pages/auth/OtpVerificationForm';
import ResetPasswordForm from '../pages/auth/ResetPasswordForm';
import SuccessScreen from '../pages/auth/SuccessScreen';
import Dashboard from '../components/dashboard/Dashboard';

const AuthPages: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // لو اليوزر مسجل دخول خلاص، وديه على الداشبورد
    if (isAuthenticated) {
        return <Navigate to={PATHS.DASHBOARD} replace />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-slate-50">
            <AuthLayout>
                <LoginForm
                    onForgotPassword={() => navigate(PATHS.FORGOT_PASSWORD)}
                    onLoginSuccess={() => navigate(PATHS.DASHBOARD)}
                />
            </AuthLayout>
        </div>
    );
};

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [, setResetEmail] = useState('');

    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-slate-50">
            <AuthLayout>
                <ForgotPasswordForm
                    onContinue={(email) => {
                        setResetEmail(email);
                        // حفظ الايميل في sessionStorage عشان نستخدمه في الصفحات اللي بعد كده
                        sessionStorage.setItem('resetEmail', email);
                        navigate(PATHS.VERIFY_OTP);
                    }}
                    onBack={() => navigate(PATHS.LOGIN)}
                />
            </AuthLayout>
        </div>
    );
};

const VerifyOtpPage: React.FC = () => {
    const navigate = useNavigate();
    const resetEmail = sessionStorage.getItem('resetEmail') || '';

    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-slate-50">
            <AuthLayout>
                <OtpVerificationForm
                    email={resetEmail}
                    onVerify={(otp) => {
                        sessionStorage.setItem('resetOtp', otp);
                        navigate(PATHS.RESET_PASSWORD);
                    }}
                    onBack={() => navigate(PATHS.FORGOT_PASSWORD)}
                />
            </AuthLayout>
        </div>
    );
};

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const resetEmail = sessionStorage.getItem('resetEmail') || '';
    const resetOtp = sessionStorage.getItem('resetOtp') || '';

    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-slate-50">
            <AuthLayout>
                <ResetPasswordForm
                    email={resetEmail}
                    otp={resetOtp}
                    onContinue={() => {
                        // Clear session storage
                        sessionStorage.removeItem('resetEmail');
                        sessionStorage.removeItem('resetOtp');
                        navigate(PATHS.SUCCESS);
                    }}
                    onBack={() => navigate(PATHS.VERIFY_OTP)}
                />
            </AuthLayout>
        </div>
    );
};

const SuccessPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-slate-50">
            <AuthLayout>
                <SuccessScreen
                    onBackToLogin={() => navigate(PATHS.LOGIN)}
                />
            </AuthLayout>
        </div>
    );
};

export const AppRoutes: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate(PATHS.LOGIN);
    };

    return (
        <Routes>
            {/* Auth Routes — كل صفحة لوحدها */}
            <Route path="/" element={<AuthPages />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/success" element={<SuccessPage />} />

            {/* Dashboard — Protected */}
            <Route
                path="/dashboard/*"
                element={
                    <ProtectedRoute>
                        <Dashboard onLogout={handleLogout} />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};