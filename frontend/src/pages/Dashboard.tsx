import { FileText, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { Layout } from "../components/Layout";
import { PrintableServiceOrder } from "../components/PrintableServiceOrder";
import { ServiceOrderForm } from "../components/ServiceOrderForm";
import { ServiceOrderList } from "../components/ServiceOrderList";
import type { ServiceOrderWithDetails } from "../types/ServiceOrder";

export function Dashboard() {
  const [orders, setOrders] = useState<ServiceOrderWithDetails[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<ServiceOrderWithDetails | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] =
    useState<ServiceOrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (!currentUser.id) return;
      const ordersData = await apiClient.getServiceOrders(currentUser.id);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleEdit = (order: ServiceOrderWithDetails) => {
    setSelectedOrderForEdit(order);
    setShowForm(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await apiClient.deleteServiceOrder(orderId);
      loadOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setOrderToDelete(null);
    }
  };

  const handleSuccess = useCallback(() => {
    loadOrders();
    setShowForm(false);
    setSelectedOrder(null);
    setSelectedOrderForEdit(null);
  }, []); // Empty deps if loadOrders is also memoized

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
      name: "Faturamento Total",
      value: `R$ ${orders
        .reduce((acc, order) => acc + (order.total || 0), 0)
        .toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-yellow-500",
    },
  ];

  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg animate-pulse"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-700" />
              <div className="ml-5 w-full">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (selectedOrder) {
    return (
      <PrintableServiceOrder
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <Layout>
      <div className="py-8">
        {/* Stats Grid */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
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
        )}

        {/* Orders Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Ordens de Serviço
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Nova Ordem
            </button>
          </div>

          {showForm ? (
            <div className="p-6">
              <ServiceOrderForm
                onSuccess={handleSuccess}
                existingOrder={selectedOrderForEdit || undefined}
              />
            </div>
          ) : (
            <ServiceOrderList
              onEdit={handleEdit}
              onPrint={setSelectedOrder}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete) {
            handleDeleteOrder(orderToDelete).then(handleSuccess);
          }
        }}
      />
    </Layout>
  );
}
