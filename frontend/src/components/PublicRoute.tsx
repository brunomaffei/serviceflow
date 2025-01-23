import { Navigate } from "react-router-dom";

export function PublicRoute() {
  const isAuthenticated = !!localStorage.getItem("currentUser");
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}
