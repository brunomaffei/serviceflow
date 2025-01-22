"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const PrismaClient = require("@prisma/client").PrismaClient;
exports.prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
    global.prisma = exports.prisma;
}
