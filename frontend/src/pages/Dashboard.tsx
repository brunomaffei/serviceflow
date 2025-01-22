import {
  Calendar,
  FileText,
  Printer,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { Header } from "../components/Header";
import { PrintableServiceOrder } from "../components/PrintableServiceOrder";
import { ServiceOrderForm } from "../components/ServiceOrderForm";
import type { ServiceOrder } from "../types/ServiceOrder";

export function Dashboard() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (!currentUser.id) return;

      const ordersData = await apiClient.getServiceOrders(currentUser.id);
      console.log("Orders data:", ordersData); // Debug log

      // Garantir que ordersData é um array
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]); // Inicializar como array vazio em caso de erro
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOrderSuccess = () => {
    setShowForm(false);
    loadOrders(); // Recarregar ordens após criar uma nova
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await apiClient.deleteServiceOrder(orderId);
      loadOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setOrderToDelete(null); // Fechar o modal após a conclusão
    }
  };

  const stats = [
    {
      name: "Total de Ordens",
      value: orders.length,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      name: "Clientes Atendidos",
      value: new Set(orders.map((order) => order.client)).size,
      icon: Users,
      color: "bg-green-500",
    },
    {
      name: "Ordens este Mês",
      value: orders.filter((order) => {
        const orderDate = new Date(order.date);
        const now = new Date();
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }).length,
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      name: "Faturamento Total",
      value: `R$ ${orders
        .reduce((acc, order) => acc + (order.total || 0), 0)
        .toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-yellow-500",
    },
  ];

  if (selectedOrder) {
    return (
      <PrintableServiceOrder
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    );
  }

  // Adicionar verificação antes do map
  const validOrders = Array.isArray(orders) ? orders : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {showForm ? "Nova Ordem de Serviço" : "Ordens de Serviço"}
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showForm ? "Voltar para Lista" : "Nova Ordem"}
          </button>
        </div>

        {/* Form or List */}
        {showForm ? (
          <ServiceOrderForm onSuccess={handleOrderSuccess} />
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Frota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {validOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {order.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {order.fleet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      R$ {order.total?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Imprimir"
                        >
                          <Printer className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setOrderToDelete(order.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Deletar"
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
        )}
      </main>
      <DeleteConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => orderToDelete && handleDeleteOrder(orderToDelete)}
      />
    </div>
  );
}
