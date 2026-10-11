import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    // Not authenticated: open the matching login page and remember the requested page
    const loginTarget = location.pathname.startsWith('/staff') ? '/login?role=staff' : '/login';
    return <Navigate to={loginTarget} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if trying to access unauthorized route
    if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
    if (user.role === 'STAFF') return <Navigate to="/staff" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
