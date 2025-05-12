import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, checkSessionTimeout, updateLastActivity } = useAuthStore();
  const navigate = useNavigate();

  // Check for session timeout
  useEffect(() => {
    const interval = setInterval(() => {
      const isTimedOut = checkSessionTimeout();
      if (isTimedOut) {
        navigate('/login', { replace: true });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkSessionTimeout, navigate]);

  // Update last activity on user interaction
  useEffect(() => {
    const handleActivity = () => {
      updateLastActivity();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [updateLastActivity]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;