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
