export interface CompanyInfo {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  userId: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  value: number;
  serviceOrderId: string;
  unitPrice: number;
  total: number;
  orderId?: string;
}

export interface ServiceOrder {
  id: string;
  description: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
  client: string;
  fleet: string;
  farm?: string;
  user: User & {
    companyInfo: CompanyInfo | null;
  };
  total: number;
  items: ServiceItem[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: "METERS" | "UNITS";
  createdAt: string;
}

export interface Client {
  id: string;
  type: "PF" | "PJ";
  name: string;
  document: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  companyName?: string | null;
  tradingName?: string | null;
  stateRegistration?: string | null;
  createdAt: string;
  userId: string;
  cep: string;
}
