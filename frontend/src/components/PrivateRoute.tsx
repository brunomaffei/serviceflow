import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = () => {
    const user = localStorage.getItem("currentUser");
    return !!user;
  };

  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}
