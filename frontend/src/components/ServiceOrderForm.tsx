import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiClient } from "../api/client";
import type { ServiceItem } from "../types/ServiceOrder";

interface ServiceOrderFormProps {
  onSuccess: () => void;
}

export function ServiceOrderForm({ onSuccess }: ServiceOrderFormProps) {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [message, setMessage] = useState<string>("");
  const { register, handleSubmit, reset } = useForm();

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        orderId: crypto.randomUUID(), // Add temporary orderId that will be replaced when the order is created
        quantity: 0,
        description: "",
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const onSubmit = async (data: any) => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (!currentUser.id) {
        throw new Error("Usuário não encontrado");
      }

      // Validate items
      if (items.length === 0) {
        setMessage("Adicione pelo menos um item à ordem de serviço");
        return;
      }

      const total = items.reduce((acc, item) => acc + item.total, 0);

      const orderData = {
        client: data.client,
        date: new Date(data.date).toISOString(),
        fleet: data.fleet,
        farm: data.farm || "",
        description: data.description || "",
        items: items.map((item) => ({
          quantity: Number(item.quantity),
          description: item.description,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
        total: Number(total),
        userId: currentUser.id,
      };

      console.log("Sending order data:", orderData); // Debug log

      const response = await apiClient.createServiceOrder(orderData);
      console.log("Response:", response); // Debug log

      reset();
      setItems([]);
      setMessage("Ordem de serviço criada com sucesso!");

      // Remover o redirecionamento automático e usar o onSuccess
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar ordem de serviço:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao criar ordem de serviço"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-md shadow-lg"
    >
      {message && (
        <div
          className={`p-4 rounded-md mb-6 ${
            message.includes("sucesso")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Informações Principais */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-md border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Informações do Serviço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cliente *
            </label>
            <input
              type="text"
              {...register("client", {
                required: "Nome do cliente é obrigatório",
              })}
              placeholder="Nome completo do cliente"
              className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data do Serviço *
            </label>
            <input
              type="date"
              {...register("date", { required: "Data é obrigatória" })}
              className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Frota/Placa *
            </label>
            <input
              type="text"
              {...register("fleet", { required: "Frota/Placa é obrigatória" })}
              placeholder="Ex: ABC-1234 ou FROTA-001"
              className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fazenda
            </label>
            <input
              type="text"
              {...register("farm")}
              placeholder="Nome da fazenda"
              className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            />
          </div>
        </div>
      </div>

      {/* Itens do Serviço */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-md border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Itens do Serviço
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </button>
        </div>

        {/* Headers for the items table */}
        <div className="grid grid-cols-[100px_1fr_150px_150px_50px] gap-2 mb-2 px-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Quantidade
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Descrição do Serviço
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Preço Unit.
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total
          </div>
          <div></div>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[100px_1fr_150px_150px_50px] gap-2 items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md"
            >
              <input
                type="number"
                min="0"
                placeholder="Qtd."
                className="w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={item.quantity || ""}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].quantity = Number(e.target.value);
                  newItems[index].total =
                    newItems[index].quantity * newItems[index].unitPrice;
                  setItems(newItems);
                }}
              />
              <input
                type="text"
                placeholder="Ex: Troca de óleo, filtros, etc."
                className="w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={item.description}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].description = e.target.value;
                  setItems(newItems);
                }}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="R$ 0,00"
                className="w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={item.unitPrice || ""}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].unitPrice = Number(e.target.value);
                  newItems[index].total =
                    newItems[index].quantity * newItems[index].unitPrice;
                  setItems(newItems);
                }}
              />
              <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md text-gray-900 dark:text-white text-right">
                R$ {item.total.toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md"
                title="Remover item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

          {items.length > 0 && (
            <div className="flex justify-end mt-4 border-t dark:border-gray-700 pt-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                Total: R${" "}
                {items.reduce((acc, item) => acc + item.total, 0).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
        >
          Salvar Ordem de Serviço
        </button>
      </div>
    </form>
  );
}
