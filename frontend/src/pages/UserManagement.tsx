import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiClient } from "../api/client";
import { Header } from "../components/Header";

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface NewUser {
  email: string;
  password: string;
  role: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    password: "",
    role: "USER",
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    if (!currentUser || !currentUser.id) {
      setError("Usuário não encontrado");
      return;
    }

    if (currentUser.role !== "ADMIN") {
      setError("Apenas administradores podem acessar esta página");
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      console.log("Fetching users with admin:", currentUser);

      if (!currentUser.id || !currentUser.role) {
        setError("Usuário não autenticado");
        return;
      }

      if (currentUser.role !== "ADMIN") {
        setError(
          "Acesso negado: apenas administradores podem acessar esta página"
        );
        return;
      }

      const data = await apiClient.getUsers(currentUser.id);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      setError(error.message || "Erro ao carregar usuários");
      setUsers([]); // Garante que users seja sempre um array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      await apiClient.createUser(newUser, currentUser.id);
      setIsCreating(false);
      setNewUser({ email: "", password: "", role: "USER" });
      fetchUsers();
      toast.success("Usuário criado com sucesso!");
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Erro ao criar usuário");
    }
  };

  // Adicionar mensagem de erro na UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center text-red-600 dark:text-red-400 mt-8">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
      <ToastContainer />
      <Header />

      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-600 dark:text-gray-300">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isCreating ? "Novo Usuário" : "Usuários"}
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Desktop Title and Button */}
        <div className="mb-6 hidden md:flex md:justify-between md:items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isCreating ? "Novo Usuário" : "Gerenciamento de Usuários"}
          </h1>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </button>
          )}
        </div>

        {isCreating ? (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
            <form onSubmit={handleCreateUser}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Função
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="USER">Usuário</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Data de Criação
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {user.role === "ADMIN"
                              ? "Administrador"
                              : "Usuário"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  <div className="grid grid-cols-1 gap-4 p-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                      >
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Função:{" "}
                            {user.role === "ADMIN"
                              ? "Administrador"
                              : "Usuário"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Criado em:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 md:hidden">
        <div className="flex items-center justify-around p-3">
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Novo Usuário</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
