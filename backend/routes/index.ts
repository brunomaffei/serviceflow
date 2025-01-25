import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Rotas de Produtos
router.get("/products", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Rotas de Clientes
router.get("/clients", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const clients = await prisma.client.findMany({
      where: { userId },
    });
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Error fetching clients" });
  }
});

// Rotas de Usuários
router.get("/users", async (_req: Request, res: Response) => {
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
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

export { router };
