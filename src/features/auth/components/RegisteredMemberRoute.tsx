import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRegisteredRoles } from '../../../constants';

/** Allows navigation only when the user has real roles assigned (excludes Waiting / empty JWT roles). */
export const RegisteredMemberRoute: React.FC = () => {
  const { isAuthenticated, isLoading, roles } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRegisteredRoles(roles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
