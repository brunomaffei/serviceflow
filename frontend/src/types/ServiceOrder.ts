import type {
  Client,
  CompanyInfo,
  Product,
  ServiceItem,
  ServiceOrder,
  User,
} from "./interfaces";

export type ServiceOrderWithDetails = ServiceOrder & {
  items: ServiceItem[];
  user: User & {
    companyInfo: CompanyInfo | null;
  };
};

export type { Client, CompanyInfo, Product, ServiceItem, ServiceOrder, User };
