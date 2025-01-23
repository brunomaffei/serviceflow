import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiClient } from "../api/client";
import type {
  ServiceItem,
  ServiceOrderWithDetails,
} from "../types/ServiceOrder";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface Client {
  id: string;
  name: string;
  document: string;
  type: "PF" | "PJ";
  companyName?: string;
}

interface ServiceOrderFormProps {
  onSuccess: () => void;
  existingOrder?: ServiceOrderWithDetails; // Adicionar esta prop
}

export function ServiceOrderForm({
  onSuccess,
  existingOrder,
}: ServiceOrderFormProps) {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [message, setMessage] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const { register, handleSubmit, reset, setValue } = useForm();
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadProducts();
    loadClients();

    // Preencher o formulário se existir uma ordem
    if (existingOrder) {
      setValue("client", existingOrder.client);
      setValue(
        "date",
        new Date(existingOrder.date).toISOString().split("T")[0]
      );
      setValue("fleet", existingOrder.fleet);
      setValue("farm", existingOrder.farm);
      setItems(
        existingOrder.items.map((item) => ({
          ...item,
          id: item.id || crypto.randomUUID(),
          orderId: existingOrder.id,
        }))
      );
    }
  }, [existingOrder]);

  const loadClients = async () => {
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
    }
  };

  const loadProducts = async () => {
    try {
      const products = await apiClient.getProducts();
      setProducts(products);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Erro ao carregar produtos");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter((client) =>
    (client.type === "PF" ? client.name : client.companyName || client.name)
      .toLowerCase()
      .includes(clientSearchTerm.toLowerCase())
  );

  const addItem = () => {
    const newItem: ServiceItem = {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      value: 0,
      serviceOrderId: "",
      unitPrice: 0,
      total: 0,
      orderId: crypto.randomUUID(),
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const openProductSearchForItem = (index: number) => {
    setCurrentEditingIndex(index);
    setShowProductSearch(true);
  };

  const selectProduct = (product: Product, itemIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      description: product.name,
      unitPrice: product.price,
      total: product.price * newItems[itemIndex].quantity,
    };
    setItems(newItems);
    setShowProductSearch(false);
    setSearchTerm("");
  };

  const selectClient = (client: Client) => {
    setValue(
      "client",
      client.type === "PF" ? client.name : client.companyName || client.name
    );
    setShowClientSearch(false);
    setClientSearchTerm("");
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
        toast.error("Adicione pelo menos um item à ordem de serviço");
        return;
      }

      const total = items.reduce((acc, item) => acc + item.total, 0);

      const orderData = {
        id: existingOrder?.id, // Incluir ID se for edição
        client: data.client,
        date: new Date(data.date).toISOString(),
        fleet: data.fleet,
        farm: data.farm || "",
        description: data.description || "",
        items: items.map((item) => ({
          id: item.id,
          quantity: Number(item.quantity),
          description: item.description,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
        total: Number(total),
        userId: currentUser.id,
      };

      if (existingOrder) {
        await apiClient.updateServiceOrder(orderData);
        toast.success("Ordem de serviço atualizada com sucesso!");
      } else {
        await apiClient.createServiceOrder(orderData);
        toast.success("Ordem de serviço criada com sucesso!");
      }

      reset();
      setItems([]);
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar ordem de serviço:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao salvar ordem de serviço"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Informações Principais - Layout Responsivo */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 md:p-6 rounded-md border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Informações do Serviço
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {/* Cliente Input com Search - Mobile Friendly */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente *
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("client", {
                  required: "Nome do cliente é obrigatório",
                })}
                placeholder="Selecione o cliente"
                className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                onClick={() => setShowClientSearch(true)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Campos de Data e Frota em uma linha no mobile */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data do Serviço *
            </label>
            <input
              type="date"
              {...register("date", { required: "Data é obrigatória" })}
              className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Frota/Placa *
            </label>
            <input
              type="text"
              {...register("fleet", { required: "Frota/Placa é obrigatória" })}
              placeholder="ABC-1234"
              className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fazenda
            </label>
            <input
              type="text"
              {...register("farm")}
              placeholder="Nome da fazenda"
              className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Itens do Serviço - Layout Responsivo */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 md:p-6 rounded-md border border-gray-200 dark:border-gray-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-0">
            Itens do Serviço
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm w-full md:w-auto justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </button>
        </div>

        {/* Items List - Mobile Optimized */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {/* Mobile Layout for Items */}
              <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_150px_150px_50px] gap-4 md:gap-2">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity || ""}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].quantity = Number(e.target.value);
                      newItems[index].total =
                        newItems[index].quantity * newItems[index].unitPrice;
                      setItems(newItems);
                    }}
                    className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden">
                    Descrição
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].description = e.target.value;
                        setItems(newItems);
                      }}
                      placeholder="Descrição do serviço"
                      className="w-full h-12 px-4 pr-10 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => openProductSearchForItem(index)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Search className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden">
                    Preço Unit.
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice || ""}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].unitPrice = Number(e.target.value);
                      newItems[index].total =
                        newItems[index].quantity * newItems[index].unitPrice;
                      setItems(newItems);
                    }}
                    placeholder="R$ 0,00"
                    className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden">
                    Total
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md text-gray-900 dark:text-white text-right">
                    R$ {item.total.toFixed(2)}
                  </div>
                </div>

                <div className="flex justify-end mt-4 md:mt-0">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total - Responsive */}
        {items.length > 0 && (
          <div className="flex justify-end mt-6 pt-4 border-t dark:border-gray-700">
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              Total: R${" "}
              {items.reduce((acc, item) => acc + item.total, 0).toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Client Search Modal */}
      {showClientSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Selecionar Cliente
            </h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600 rounded-md mb-2 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {client.type === "PF" ? client.name : client.companyName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {client.document}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowClientSearch(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Selecionar Produto
            </h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() =>
                    currentEditingIndex !== null &&
                    selectProduct(product, currentEditingIndex)
                  }
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600 rounded-md mb-2 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    R$ {product.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProductSearch(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions - Fixed on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 md:relative md:bg-transparent md:border-0 md:p-0 md:flex md:justify-end">
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={onSuccess}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </form>
  );
}
