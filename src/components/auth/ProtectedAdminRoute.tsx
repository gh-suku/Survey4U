import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../../lib/api';

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = isAdminAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
