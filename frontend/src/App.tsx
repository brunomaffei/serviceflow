import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Clients } from "./pages/Clients";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Products } from "./pages/Products";
import { Profile } from "./pages/Profile";
import { ServiceOrders } from "./pages/ServiceOrders";
import { UserManagement } from "./pages/UserManagement";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  // Simplificada: verifica apenas ID e role
  const isAuthenticated = !!currentUser?.id;
  const hasPermission = allowedRoles.includes(currentUser?.role || "USER"); // default to USER

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("Não autenticado:", currentUser);
      localStorage.removeItem("currentUser");
    }
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    console.log("Redirecionando para login: dados inválidos"); // Debug
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission) {
    console.log("Sem permissão necessária"); // Debug
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem("darkTheme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === null && prefersDark) {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "true") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route path="/clientes" element={<Clients />} />
          <Route
            path="/service-orders"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <ServiceOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
