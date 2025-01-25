"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function resetDatabase() {
    try {
        // Limpar o banco
        console.log("Limpando banco de dados...");
        await prisma.serviceItem.deleteMany();
        await prisma.serviceOrder.deleteMany();
        await prisma.companyInfo.deleteMany();
        await prisma.client.deleteMany();
        await prisma.user.deleteMany();
        // Criar usuário admin
        const adminPassword = "admin123"; // senha fácil para testes
        const hashedPassword = await (0, bcryptjs_1.hash)(adminPassword, 10);
        const adminUser = await prisma.user.create({
            data: {
                email: "admin@test.com",
                password: hashedPassword,
                role: "ADMIN",
                companyInfo: {
                    create: {
                        name: "Empresa Teste",
                        cnpj: "00.000.000/0001-00",
                        address: "Rua Teste, 123",
                        phone: "(00) 0000-0000",
                        email: "teste@empresa.com",
                    },
                },
            },
        });
        console.log("\nBanco de dados resetado com sucesso!");
        console.log("\nUsuário admin criado:");
        console.log("Email:", adminUser.email);
        console.log("Senha:", adminPassword);
        console.log("Role:", adminUser.role);
    }
    catch (error) {
        console.error("Erro ao resetar banco de dados:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
resetDatabase();
