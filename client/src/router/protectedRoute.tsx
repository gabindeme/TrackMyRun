import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/authContext";

interface ProtectedRouteProps {
  authRequired: boolean;
  role?: string;
  redirectTo?: string;
  children: ReactNode;
}

export const ProtectedRoute = ({
  authRequired,
  role,
  redirectTo = "/",
  children
}: ProtectedRouteProps) => {
  const { authUser } = useAuthContext();

  // If role is required and user doesn't have it, redirect
  if (authUser && role && authUser.role !== role) {
    return <Navigate to="/" replace />;
  }

  // If auth is required but user is not logged in, redirect to login
  if (authRequired && !authUser) {
    return <Navigate to="/login" replace />;
  }

  // If auth is NOT required but user IS logged in, redirect to specified route
  if (!authRequired && authUser) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};
