import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { PrintableServiceOrder } from "../components/PrintableServiceOrder";
import { ServiceOrderForm } from "../components/ServiceOrderForm";
import { ServiceOrderList } from "../components/ServiceOrderList";
import type { ServiceOrderWithDetails } from "../types/ServiceOrder";

export function ServiceOrders() {
  const [view, setView] = useState<"list" | "form" | "print">("list");
  const [selectedOrder, setSelectedOrder] = useState<
    ServiceOrderWithDetails | undefined
  >();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const isAdmin = currentUser?.role === "ADMIN";

  const handleEdit = (order: ServiceOrderWithDetails) => {
    setSelectedOrder(order);
    setView("form");
  };

  const handlePrint = (order: ServiceOrderWithDetails) => {
    setSelectedOrder(order);
    setView("print");
  };

  const handleFormSuccess = () => {
    setView("list");
    setSelectedOrder(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
      <Header />

      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-600 dark:text-gray-300">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {view === "form"
              ? selectedOrder
                ? "Editar Ordem"
                : "Nova Ordem"
              : "Ordens de Serviço"}
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mb-16 md:mb-0">
        {view === "list" && (
          <>
            {/* Desktop Title and Button */}
            <div className="mb-6 hidden md:flex md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Ordens de Serviço
              </h1>
              {isAdmin && (
                <button
                  onClick={() => setView("form")}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ordem
                </button>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <ServiceOrderList
                onEdit={handleEdit}
                onPrint={handlePrint}
                onSuccess={handleFormSuccess}
              />
            </div>
          </>
        )}

        {view === "form" && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
            <ServiceOrderForm
              onSuccess={handleFormSuccess}
              existingOrder={selectedOrder}
            />
          </div>
        )}

        {view === "print" && selectedOrder && (
          <PrintableServiceOrder
            order={selectedOrder}
            onClose={() => setView("list")}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {view === "list" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 md:hidden">
          <div className="flex items-center justify-around p-3">
            <button
              onClick={() => setView("form")}
              className="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Nova Ordem</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
