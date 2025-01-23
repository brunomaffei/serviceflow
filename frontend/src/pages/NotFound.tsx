import { AlertTriangle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("currentUser");

  const handleRedirect = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="relative">
          <AlertTriangle className="mx-auto h-20 w-20 text-yellow-500" />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            Página não encontrada
          </h2>
          <p className="text-gray-500">
            Desculpe, a página que você está procurando não existe ou foi
            movida.
          </p>
        </div>

        <button
          onClick={handleRedirect}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          <Home className="w-5 h-5 mr-2" />
          Voltar para {isAuthenticated ? "Dashboard" : "Login"}
        </button>
      </div>
    </div>
  );
}
