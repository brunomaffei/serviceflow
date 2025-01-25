"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
exports.router = router;
// Rotas de Produtos
router.get("/products", async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany();
        res.json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});
// Rotas de Clientes
router.get("/clients", async (req, res) => {
    try {
        const { userId } = req.query;
        const clients = await prisma_1.prisma.client.findMany({
            where: { userId: userId },
        });
        res.json(clients);
    }
    catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ error: "Error fetching clients" });
    }
});
// Rotas de Usuários
router.get("/users", async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true,
                role: true,
                companyInfo: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
});
