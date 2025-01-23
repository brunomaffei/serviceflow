import { LogOut, Moon, Settings, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { DefaultLogo } from "./DefaultLogo";

export function Header() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const logoSrc = localStorage.getItem("companyLogo");

  return (
    <header className="bg-white shadow-md border-b sticky top-0 z-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Company Logo"
              className="h-10 w-10 object-contain rounded"
            />
          ) : (
            <div className="h-10 w-10 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded p-2">
              <DefaultLogo />
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
            ServiceFlow Pro
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 tooltip"
            title={isDark ? "Modo Claro" : "Modo Escuro"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => navigate("/perfil")}
            className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200 text-blue-600 dark:text-blue-400 tooltip"
            title="Configurações"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400 tooltip"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
