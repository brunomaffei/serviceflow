import { Prisma } from "@prisma/client";

declare global {
  namespace PrismaJson {
    type Decimal = Prisma.Decimal;
  }
}
