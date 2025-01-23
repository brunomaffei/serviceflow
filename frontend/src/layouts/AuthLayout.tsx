import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAuthenticated = !!localStorage.getItem("currentUser");
    const isLoginPage = location.pathname === "/login";

    if (!isAuthenticated && !isLoginPage) {
      navigate("/login", { replace: true, state: { from: location } });
    }

    if (isAuthenticated && isLoginPage) {
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  return <>{children}</>;
}
