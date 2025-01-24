import {
  FileText,
  LogOut,
  Moon,
  Package,
  Settings,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { DefaultLogo } from "./DefaultLogo";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    {
      name: "Dashboard",
      icon: TrendingUp,
      path: "/dashboard",
      allowedRoles: ["ADMIN", "USER"], // todos podem ver
    },
    {
      name: "Ordens", // Mudado de "Ordens de Serviço" para "Ordens"
      icon: FileText, // adicione o import
      path: "/service-orders",
      allowedRoles: ["ADMIN", "USER"], // todos podem ver
    },
    {
      name: "Produtos",
      icon: Package,
      path: "/produtos",
      allowedRoles: ["ADMIN"], // apenas admin
    },
    {
      name: "Clientes",
      icon: Users,
      path: "/clientes",
      allowedRoles: ["ADMIN"], // apenas admin
    },
  ];

  const adminNavItems = [
    {
      name: "Usuários",
      icon: Users,
      path: "/usuarios",
      allowedRoles: ["ADMIN"], // apenas admin
    },
  ];

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const isAdmin = currentUser?.role === "ADMIN";

  // Filtra os itens baseado no role do usuário e mantém a ordem
  const filteredNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(currentUser?.role || "")
  );

  // Modify the nav items section to include admin items
  const allNavItems = [...filteredNavItems, ...(isAdmin ? adminNavItems : [])];

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const logoSrc = localStorage.getItem("companyLogo");

  return (
    <>
      <header className="bg-white shadow-md border-b sticky top-0 z-50 dark:bg-gray-800 dark:border-gray-700 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3">
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
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1 max-w-md mx-8">
            {allNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 tooltip"
              title={isDark ? "Modo Claro" : "Modo Escuro"}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate("/perfil")}
                className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200 text-blue-600 dark:text-blue-400 tooltip"
                title="Configurações"
              >
                <Settings size={20} />
              </button>
            )}
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

      {/* Mobile Navigation */}
      <div className="md:hidden border-t dark:border-gray-700">
        <nav className="flex items-center justify-around p-2">
          {allNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Adicionar botões de ações */}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-300"
          >
            {isDark ? (
              <>
                <Sun size={20} />
                <span className="text-xs font-medium">Claro</span>
              </>
            ) : (
              <>
                <Moon size={20} />
                <span className="text-xs font-medium">Escuro</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/perfil")}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-300"
          >
            <Settings size={20} />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </nav>
      </div>
    </>
  );
}
