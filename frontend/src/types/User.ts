import type { CompanyInfo, Users as PrismaUser } from "@prisma/client";

export type User = Omit<PrismaUser, "password"> & {
  companyInfo?: CompanyInfo | null;
};
