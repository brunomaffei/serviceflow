import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Rotas de Produtos
router.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Rotas de Clientes
router.get("/clients", async (req, res) => {
  try {
    const { userId } = req.query;
    const clients = await prisma.client.findMany({
      where: { userId: userId as string },
    });
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Error fetching clients" });
  }
});

// Rotas de Usuários
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true,
        companyInfo: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

export { router };
