"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        datasources: {
            db: {
                url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
            },
        },
        log: ["query", "info", "warn", "error"],
    });
};
const prisma = (_a = globalThis.prisma) !== null && _a !== void 0 ? _a : prismaClientSingleton();
exports.prisma = prisma;
// Log de teste para verificar a conexão
prisma
    .$connect()
    .then(() => console.log("Successfully connected to database"))
    .catch((e) => console.error("Failed to connect to database:", e));
if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}
