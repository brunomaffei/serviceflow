import { useForm } from "react-hook-form";
import type { Product } from "../types/ServiceOrder";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Omit<Product, "id" | "createdAt">) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      quantity: product?.quantity || 0,
      unit: product?.unit || "UNITS",
    },
  });

  const onFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      price: Number(data.price),
      quantity: Math.round(Number(data.quantity)), // Convert to integer
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-md border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Informações do Produto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome do Produto *
            </label>
            <input
              type="text"
              {...register("name", { required: true })}
              className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
              placeholder="Nome do produto"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Preço *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price", { required: true, min: 0 })}
              className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
              placeholder="R$ 0,00"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantidade *
            </label>
            <input
              type="number"
              step="1"
              min="0"
              {...register("quantity", {
                required: true,
                min: 0,
                validate: (value) =>
                  Number.isInteger(Number(value)) ||
                  "A quantidade deve ser um número inteiro",
              })}
              className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unidade *
            </label>
            <select
              {...register("unit", { required: true })}
              className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            >
              <option value="UNITS">Unidades</option>
              <option value="METERS">Metros</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
        >
          {product ? "Atualizar" : "Criar"} Produto
        </button>
      </div>
    </form>
  );
}
