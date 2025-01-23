import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = () => {
    const user = localStorage.getItem("currentUser");
    return !!user;
  };

  // Se não estiver autenticado, redireciona para 404
  if (!isAuthenticated()) {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
}
