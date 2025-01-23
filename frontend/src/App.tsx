import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthLayout } from "./layouts/AuthLayout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Profile } from "./pages/Profile";

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
        <AuthLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
