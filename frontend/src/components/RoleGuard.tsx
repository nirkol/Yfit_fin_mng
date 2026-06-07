import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'trainer')[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { userRole } = useAuth();

  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect non-admin users to attendance page
    return <Navigate to="/attendance" replace />;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>;
}
