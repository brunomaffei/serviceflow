import { Building2, User2 } from "lucide-react";
import { forwardRef, useState } from "react";
import { useForm } from "react-hook-form";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";
import { Client } from "../types/interfaces";
("../types/ServiceOrder");

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface ClientFormProps {
  client?: Client;
  onSubmit: (client: Omit<Client, "id" | "createdAt">) => void;
  onCancel: () => void;
}

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string;
}

// Função para validar CPF
const isValidCPF = (cpf: string) => {
  const numericCPF = cpf.replace(/\D/g, "");

  if (numericCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numericCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numericCPF[i]) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numericCPF[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numericCPF[i]) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numericCPF[10])) return false;

  return true;
};

// Função para validar CNPJ
const isValidCNPJ = (cnpj: string) => {
  const numericCNPJ = cnpj.replace(/\D/g, "");

  if (numericCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(numericCNPJ)) return false;

  let size = numericCNPJ.length - 2;
  let numbers = numericCNPJ.substring(0, size);
  const digits = numericCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = numericCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

// Atualizar o componente MaskedInput usando react-input-mask
const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, onBlur, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numericValue = value.replace(/\D/g, "");

      // Validações no blur
      if (mask === "999.999.999-99" && numericValue.length === 11) {
        if (!isValidCPF(value)) {
          toast.error("CPF inválido");
        }
      } else if (mask === "99.999.999/9999-99" && numericValue.length === 14) {
        if (!isValidCNPJ(value)) {
          toast.error("CNPJ inválido");
        }
      }

      onBlur?.(e);
    };

    return (
      <InputMask mask={mask} onChange={onChange} onBlur={handleBlur} {...props}>
        {(inputProps: any) => (
          <input
            {...inputProps}
            ref={ref}
            className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        )}
      </InputMask>
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const [clientType, setClientType] = useState<"PF" | "PJ">(
    client?.type || "PF"
  );
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
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
      cep: client?.cep || "",
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

  // Função para buscar CEP
  const handleCepBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const cep = event.target.value.replace(/\D/g, "");

    if (cep.length !== 8) return;

    try {
      setIsLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (!data.erro) {
        setValue("address", `${data.logradouro}, ${data.bairro}`);
        setValue("city", data.localidade);
        setValue("state", data.uf);
      } else {
        toast.error("CEP não encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsLoadingCep(false);
    }
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Razão Social
              </label>
              <input
                type="text"
                {...register("companyName", { required: clientType === "PJ" })}
                className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                {...register("tradingName")}
                className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {clientType === "PF" ? "Nome Completo" : "Nome do Responsável"}
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {clientType === "PF" ? "CPF" : "CNPJ"}
          </label>
          <MaskedInput
            type="text"
            mask={clientType === "PF" ? "999.999.999-99" : "99.999.999/9999-99"}
            {...register("document", { required: true })}
          />
        </div>

        {clientType === "PJ" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Inscrição Estadual
            </label>
            <MaskedInput
              type="text"
              mask="999.999.999.999"
              {...register("stateRegistration")}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Telefone
          </label>
          <MaskedInput
            type="tel"
            mask="(99) 99999-9999"
            {...register("phone", { required: true })}
          />
        </div>

        {/* Adicionar campo CEP antes do endereço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            CEP
          </label>
          <div className="relative">
            <MaskedInput
              type="text"
              mask="99999-999"
              {...register("cep")}
              onBlur={handleCepBlur}
              className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {isLoadingCep && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Endereço
          </label>
          <input
            type="text"
            {...register("address", { required: true })}
            className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cidade
          </label>
          <input
            type="text"
            {...register("city", { required: true })}
            className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            {...register("state", { required: true })}
            className="w-full h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
