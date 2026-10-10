import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types/auth.types';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRole }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    // If student tries to visit admin page, redirect to student dashboard
    if (user.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // If admin tries to visit student page, redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
