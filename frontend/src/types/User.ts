import type { CompanyInfo, User as IUser } from "./interfaces";

export type User = Omit<IUser, "password"> & {
  companyInfo?: CompanyInfo | null;
};
