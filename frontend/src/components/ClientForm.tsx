import { Building2, User2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Client } from "../types/interfaces";
("../types/ServiceOrder");

interface ClientFormProps {
  client?: Client;
  onSubmit: (client: Omit<Client, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const [clientType, setClientType] = useState<"PF" | "PJ">(
    client?.type || "PF"
  );
  const {
    register,
    handleSubmit,
    formState: {},
  } = useForm({
    defaultValues: {
      type: client?.type || "PF",
      name: client?.name || "",
      document: client?.document || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      city: client?.city || "",
      state: client?.state || "",
      companyName: client?.companyName || "",
      tradingName: client?.tradingName || "",
      stateRegistration: client?.stateRegistration || "",
    },
  });

  const onFormSubmit = (data: any) => {
    // Ensure all required fields are present
    const clientData = {
      ...data,
      type: clientType,
      // Convert empty strings to null for optional fields
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      companyName: clientType === "PJ" ? data.companyName : null,
      tradingName: clientType === "PJ" ? data.tradingName : null,
      stateRegistration: clientType === "PJ" ? data.stateRegistration : null,
    };

    console.log("Submitting client data:", clientData); // Debug log
    onSubmit(clientData);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
    >
      {/* Client Type Toggle */}
      <div className="flex gap-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setClientType("PF")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            clientType === "PF"
              ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <User2 className="h-4 w-4" />
          Pessoa Física
        </button>
        <button
          type="button"
          onClick={() => setClientType("PJ")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            clientType === "PJ"
              ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Pessoa Jurídica
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {clientType === "PJ" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Razão Social
              </label>
              <input
                type="text"
                {...register("companyName", { required: clientType === "PJ" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome Fantasia
              </label>
              <input
                type="text"
                {...register("tradingName")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {clientType === "PF" ? "Nome Completo" : "Nome do Responsável"}
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {clientType === "PF" ? "CPF" : "CNPJ"}
          </label>
          <input
            type="text"
            {...register("document", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {clientType === "PJ" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Inscrição Estadual
            </label>
            <input
              type="text"
              {...register("stateRegistration")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Telefone
          </label>
          <input
            type="tel"
            {...register("phone", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Endereço
          </label>
          <input
            type="text"
            {...register("address", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cidade
          </label>
          <input
            type="text"
            {...register("city", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Estado
          </label>
          <select
            {...register("state", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Selecione...</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {client ? "Atualizar" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
