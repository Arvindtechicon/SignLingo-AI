import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import DashboardLayout from './components/DashboardLayout';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setCurrentPage('dashboard');
    }
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    setCurrentPage('landing');
  };

  switch (currentPage) {
    case 'landing':
      return <LandingPage onNavigate={handleNavigate} />;
    case 'login':
      return <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
    case 'register':
      return <Register onNavigate={handleNavigate} onRegisterSuccess={handleRegisterSuccess} />;
    case 'dashboard':
      return <DashboardLayout onLogout={handleLogout} />;
    default:
      return <LandingPage onNavigate={handleNavigate} />;
  }
}
