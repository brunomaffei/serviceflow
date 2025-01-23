import { Edit, Loader2Icon, Printer, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiClient } from "../api/client";
import type { ServiceOrderWithDetails } from "../types/ServiceOrder";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface ServiceOrderListProps {
  onEdit: (order: ServiceOrderWithDetails) => void;
  onPrint: (order: ServiceOrderWithDetails) => void;
  onSuccess: () => void;
}

export function ServiceOrderList({
  onEdit,
  onPrint,
  onSuccess,
}: ServiceOrderListProps) {
  const [orders, setOrders] = useState<ServiceOrderWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (currentUser.id) {
        const ordersData = await apiClient.getServiceOrders(currentUser.id);
        setOrders(ordersData);
      }
    } catch (error: any) {
      console.error("Erro ao carregar ordens:", error);
      toast.error(error.message || "Erro ao carregar ordens. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []); // Remove dependency on onSuccess

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      await apiClient.deleteServiceOrder(orderToDelete);
      toast.success("Ordem de serviço excluída com sucesso!");
      await loadOrders(); // Just reload orders
      onSuccess(); // Call onSuccess after reloading
    } catch (error) {
      console.error("Erro ao excluir ordem:", error);
      toast.error("Erro ao excluir ordem de serviço");
    } finally {
      setOrderToDelete(null);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <ToastContainer />
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Loader2Icon className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block overflow-hidden bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Frota/Placa
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {order.client}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {order.fleet}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 text-right">
                      R$ {order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => onEdit(order)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onPrint(order)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Imprimir"
                        >
                          <Printer className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setOrderToDelete(order.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {order.client}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(order)}
                      className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onPrint(order)}
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Printer className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setOrderToDelete(order.id)}
                      className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Frota/Placa: {order.fleet}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <DeleteConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={handleDeleteOrder}
      />
    </div>
  );
}
