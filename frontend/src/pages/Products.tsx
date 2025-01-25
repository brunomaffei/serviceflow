import {
  ArrowLeft,
  Loader2,
  Moon,
  Pencil,
  Plus,
  RotateCw,
  Sun,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiClient } from "../api/client";
import { Header } from "../components/Header";
import { ProductForm } from "../components/ProductForm";
import { useTheme } from "../contexts/ThemeContext";
import type { Product } from "../types/ServiceOrder";

export function Products() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log("Iniciando carregamento de produtos...");
      const data = await apiClient.getProducts();
      setProducts(Array.isArray(data) ? data : []);

      if (data.length === 0) {
        toast.info("Nenhum produto encontrado");
      }
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      setProducts([]);

      // Mensagem mais amigável para o usuário
      const errorMessage = error.message.includes("banco de dados")
        ? "Erro de conexão com o servidor. Por favor, tente novamente em alguns minutos."
        : error.message;

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (
    productData: Omit<Product, "id" | "createdAt">
  ) => {
    try {
      await apiClient.createProduct(productData);
      loadProducts();
      setShowForm(false);
      toast.success("Produto criado com sucesso!");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Erro ao criar produto");
    }
  };

  const handleEditProduct = async (
    productData: Omit<Product, "id" | "createdAt">
  ) => {
    if (!editingProduct) return;

    try {
      await apiClient.updateProduct(editingProduct.id, productData);
      loadProducts();
      setEditingProduct(null);
      setShowForm(false);
      toast.success("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Erro ao atualizar produto");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await apiClient.deleteProduct(id);
      loadProducts();
      setDeleteModalOpen(false);
      setProductToDelete(null);
      toast.success("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
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
            Tem certeza que deseja excluir este produto? Esta ação não pode ser
            desfeita.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setProductToDelete(null);
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                productToDelete && handleDeleteProduct(productToDelete)
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
              ? editingProduct
                ? "Editar Produto"
                : "Novo Produto"
              : "Produtos"}
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mb-16 md:mb-0">
        {/* Desktop Title */}
        <div className="mb-6 hidden md:flex md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white px-1">
            {showForm
              ? editingProduct
                ? "Editar Produto"
                : "Novo Produto"
              : "Produtos"}
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </button>
          )}
        </div>

        {showForm ? (
          <ProductForm
            product={editingProduct || undefined}
            onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
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
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Preço
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quantidade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Unidade
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            R$ {product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {product.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {product.unit === "METERS" ? "Metros" : "Unidades"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setProductToDelete(product.id);
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
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowForm(true);
                              }}
                              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setProductToDelete(product.id);
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
                            <span className="font-medium">Preço:</span> R${" "}
                            {product.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Quantidade:</span>{" "}
                            {product.quantity}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Unidade:</span>{" "}
                            {product.unit === "METERS" ? "Metros" : "Unidades"}
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
          <button
            onClick={() => setShowForm(true)}
            className="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Novo Produto</span>
          </button>

          <button
            onClick={() => loadProducts()}
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
