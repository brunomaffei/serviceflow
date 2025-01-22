import type {
  CompanyInfo,
  ServiceItem,
  ServiceOrder,
  User,
} from "@prisma/client";

export type ServiceOrderWithDetails = ServiceOrder & {
  items: ServiceItem[];
  user: User & {
    companyInfo: CompanyInfo | null;
  };
};

export type { CompanyInfo, ServiceItem, ServiceOrder, User };
