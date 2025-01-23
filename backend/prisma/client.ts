import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
      },
    },
    log: ["query", "info", "warn", "error"],
  });
};

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

// Log de teste para verificar a conexão
prisma
  .$connect()
  .then(() => console.log("Successfully connected to database"))
  .catch((e) => console.error("Failed to connect to database:", e));

export { prisma };

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
