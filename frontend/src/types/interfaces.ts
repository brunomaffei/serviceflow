export interface CompanyInfo {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  userId: string;
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
}

export interface ServiceOrder {
  id: string;
  description: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
