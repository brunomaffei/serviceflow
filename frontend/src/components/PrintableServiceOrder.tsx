import { ArrowLeft, Printer } from "lucide-react";
import type { ServiceOrderWithDetails } from "../types/ServiceOrder";
import { DefaultLogo } from "./DefaultLogo";

interface PrintableServiceOrderProps {
  order: ServiceOrderWithDetails;
  onClose: () => void;
}

export function PrintableServiceOrder({
  order,
  onClose,
}: PrintableServiceOrderProps) {
  const companyLogo = localStorage.getItem("companyLogo");
  const companyInfo = order.user?.companyInfo;

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Botões de ação */}
      <div className="print:hidden mb-6 flex justify-between">
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </button>
      </div>

      {/* Cabeçalho da OS */}
      <div className="border-b-2 border-gray-200 pb-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="Logo da Empresa"
                className="w-20 h-20 object-contain"
              />
            ) : (
              <div className="w-20 h-20 text-blue-600 bg-gray-50 rounded p-4">
                <DefaultLogo />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {companyInfo?.name || "Nome da Empresa"}
              </h1>
              <p className="text-gray-600">{companyInfo?.cnpj || "CNPJ"}</p>
              <p className="text-gray-600">
                {companyInfo?.address || "Endereço"}
              </p>
              <p className="text-gray-600">
                {companyInfo?.phone || "Telefone"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900">
              Ordem de Serviço
            </h2>
            <p className="text-gray-600">
              Data: {new Date(order.date).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              OS #: {order.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Informações do Cliente */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Informações do Cliente</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Cliente:</p>
            <p className="font-medium">{order.client}</p>
          </div>
          <div>
            <p className="text-gray-600">Frota/Placa:</p>
            <p className="font-medium">{order.fleet}</p>
          </div>
          {order.farm && (
            <div>
              <p className="text-gray-600">Fazenda:</p>
              <p className="font-medium">{order.farm}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Itens do Serviço</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left text-gray-600 w-20">Qtd.</th>
              <th className="py-2 text-left text-gray-600">Descrição</th>
              <th className="py-2 text-right text-gray-600 w-32">
                Valor Unit.
              </th>
              <th className="py-2 text-right text-gray-600 w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr
                key={item.id}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } border-b border-gray-200`}
              >
                <td className="py-3">{item.quantity}</td>
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right">
                  R$ {item.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 text-right">R$ {item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">R$ {order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold">
            <span>Total:</span>
            <span>R$ {order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-16 pt-16 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-gray-300 w-64 mx-auto mt-8"></div>
            <p className="text-gray-600 mt-2">
              {companyInfo?.name || "Empresa"}
            </p>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-300 w-64 mx-auto mt-8"></div>
            <p className="text-gray-600 mt-2">Cliente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
