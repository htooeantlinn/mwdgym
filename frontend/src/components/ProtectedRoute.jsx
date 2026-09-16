import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [], requiredPerm = null }) => {
  const { user, loading, hasRole, hasPerm } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-400">Loading MWD Gym...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    // If client tries to access staff dashboard, redirect to profile
    if (user.role === 'CLIENT') {
      return <Navigate to="/profile" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPerm && !hasPerm(requiredPerm)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
