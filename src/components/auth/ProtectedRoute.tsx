import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: "customer" | "staff" | "admin";
  redirectTo?: string;
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = "/auth",
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If a specific role is required but user doesn't have it
  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated but trying to access auth page, redirect to home
  if (isAuthenticated && location.pathname === "/auth") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
