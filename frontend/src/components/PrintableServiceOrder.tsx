import { ArrowLeft, Printer } from "lucide-react";
import React from "react";
import type { ServiceOrder } from "../types/ServiceOrder";
import { DefaultLogo } from "./DefaultLogo";

interface PrintableServiceOrderProps {
  order: ServiceOrder;
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

      {/* ...rest of the existing component (items table, totals, etc)... */}
    </div>
  );
}
