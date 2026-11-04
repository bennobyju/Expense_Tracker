
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Appshell from './components/Layout/Appshell';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');

      // Both token and user details must exist.
      if (!token || !user || !user.id) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }

      return user;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  });

  const pageNames = [
    'dashboard',
    'expenses',
    'income',
    'reports',
  ];

  const activeTab = location.pathname.replace('/', '') || 'dashboard';

  useEffect(() => {
    if (!currentUser && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (
      currentUser &&
      (location.pathname === '/' || location.pathname === '/login')
    ) {
      navigate('/dashboard', { replace: true });
    } else if (
      currentUser &&
      !pageNames.includes(activeTab)
    ) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, location.pathname, navigate, activeTab]);

  const handleLogin = (user) => {
    // LoginPage should save the token before calling onLogin.
    if (!localStorage.getItem('token')) {
      setCurrentUser(null);
      navigate('/login', { replace: true });
      return;
    }

    setCurrentUser(user);
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  let page;

  switch (activeTab) {
    case 'expenses':
      page = <ExpensesPage />;
      break;

    case 'income':
      page = <IncomePage />;
      break;

    case 'reports':
      page = <ReportsPage />;
      break;

    case 'dashboard':
    default:
      page = <DashboardPage />;
  }

  return (
    <Appshell
      activeTab={activeTab}
      onTabSelect={(tab) => navigate(`/${tab}`)}
      onLogout={handleLogout}
    >
      {page}
    </Appshell>
  );
}
