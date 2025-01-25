import { Loader2, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initSystem = async () => {
      try {
        const result = await apiClient.initializeAdmin();
        if (result.status === "success") {
          console.log("System initialized successfully");
        } else if (result.status === "skipped") {
          console.log("System already initialized");
        } else {
          console.log("Initialization status:", result.status);
        }
      } catch (error) {
        // Silently handle initialization errors
        console.warn("Initialization warning:", error);
      }
    };

    initSystem();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Corrigido: passando email e password separadamente
      const response = await apiClient.login(email, password);

      const userData = {
        id: response.id,
        email: response.email,
        role: response.role || "ADMIN", // Use o role da resposta se existir
        companyInfo: response.companyInfo,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      console.log("Login response:", response); // Debug
      localStorage.setItem("currentUser", JSON.stringify(userData));
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro no login:", error);
      setError(
        error?.response?.data?.error ||
          "Credenciais inválidas. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <Wrench className="h-16 w-16 text-blue-100" />
            </div>
            <Wrench className="mx-auto h-16 w-16 text-blue-600 relative z-10" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              ServiceFlow Pro
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sistema de Gerenciamento de Ordens de Serviço
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium animate-fadeIn">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="transform transition-all duration-200 hover:translate-x-1">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="seu@email.com"
              />
            </div>

            <div className="transform transition-all duration-200 hover:translate-x-1">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Entrar no Sistema"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
