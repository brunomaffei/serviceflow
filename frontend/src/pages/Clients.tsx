import {
  ArrowLeft,
  Building2,
  Loader2,
  Moon,
  Pencil,
  Plus,
  RotateCw,
  Sun,
  Trash2,
  User2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiClient } from "../api/client";
import { ClientForm } from "../components/ClientForm";
import { Header } from "../components/Header";
import { useTheme } from "../contexts/ThemeContext";
import { Client } from "../types/interfaces";

export function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (currentUser.id) {
        const clientsData = await apiClient.getClients(currentUser.id);
        setClients(clientsData);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (
    clientData: Omit<Client, "id" | "createdAt">
  ) => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (!currentUser.id) {
        throw new Error("Usuário não encontrado");
      }

      const fullClientData = {
        ...clientData,
        userId: currentUser.id,
      };

      await apiClient.createClient(fullClientData);
      loadClients();
      setShowForm(false);
      toast.success("Cliente criado com sucesso!");
    } catch (error: any) {
      console.error("Error adding client:", error.response?.data || error);
      toast.error(
        error.response?.data?.details ||
          error.response?.data?.error ||
          error.message ||
          "Erro ao criar cliente"
      );
    }
  };

  const handleEditClient = async (
    clientData: Omit<Client, "id" | "createdAt">
  ) => {
    if (!editingClient) return;

    try {
      await apiClient.updateClient(editingClient.id, clientData);
      await apiClient.updateClient(editingClient.id, clientData);
      loadClients();
      setEditingClient(null);
      setShowForm(false);
      toast.success("Cliente atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await apiClient.deleteClient(id);
      loadClients();
      setDeleteModalOpen(false);
      setClientToDelete(null);
      toast.success("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
    }
  };

  // Delete confirmation modal
  const DeleteModal = () => {
    if (!deleteModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Confirmar exclusão
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Tem certeza que deseja excluir este cliente? Esta ação não pode ser
            desfeita.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setClientToDelete(null);
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                clientToDelete && handleDeleteClient(clientToDelete)
              }
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            {showForm
              ? editingClient
                ? "Editar Cliente"
                : "Novo Cliente"
              : "Clientes"}
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mb-16 md:mb-0">
        {/* Remove título em mobile já que está no header móvel */}
        <div className="mb-6 hidden md:flex md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {showForm
              ? editingClient
                ? "Editar Cliente"
                : "Novo Cliente"
              : "Clientes"}
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </button>
          )}
        </div>

        {showForm ? (
          <ClientForm
            client={editingClient || undefined}
            onSubmit={editingClient ? handleEditClient : handleAddClient}
            onCancel={() => {
              setShowForm(false);
              setEditingClient(null);
            }}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Desktop view */}
                <div className="hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Nome / Razão Social
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Documento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contato
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {clients.map((client) => (
                        <tr
                          key={client.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {client.type === "PF" ? (
                              <User2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {client.type === "PJ"
                                ? client.companyName
                                : client.name}
                            </div>
                            {client.type === "PJ" && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {client.name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {client.document}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {client.phone}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {client.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingClient(client);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setClientToDelete(client.id);
                                setDeleteModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view */}
                <div className="md:hidden">
                  <div className="grid grid-cols-1 gap-4 p-4">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {client.type === "PF" ? (
                              <User2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            )}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {client.type === "PJ"
                                  ? client.companyName
                                  : client.name}
                              </h3>
                              {client.type === "PJ" && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {client.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingClient(client);
                                setShowForm(true);
                              }}
                              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setClientToDelete(client.id);
                                setDeleteModalOpen(true);
                              }}
                              className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Documento:</span>{" "}
                            {client.document}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Telefone:</span>{" "}
                            {client.phone}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Email:</span>{" "}
                            {client.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Endereço:</span>{" "}
                            {client.address}
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

      {/* Mobile Bottom Navigation - Simplificado e mais focado */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 md:hidden">
        <div className="flex items-center justify-around p-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Novo Cliente</span>
          </button>

          <button
            onClick={() => loadClients()}
            className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300"
          >
            <RotateCw className="h-5 w-5" />
            <span className="text-xs">Atualizar</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300"
          >
            {isDark ? (
              <>
                <Sun className="h-5 w-5" />
                <span className="text-xs">Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span className="text-xs">Escuro</span>
              </>
            )}
          </button>
        </div>
      </div>
      <DeleteModal />
    </div>
  );
}
