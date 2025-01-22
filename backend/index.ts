import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import cors from "cors";
import express, { Request, Response } from "express";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
const app = express();

// Configuração do CORS mais específica
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend-domain.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Healthcheck route
app.get("/api/healthcheck", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: String(error),
    });
  }
});

// Company Info routes
app.get("/api/company-info/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log("Fetching company info for userId:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyInfo: true },
    });

    if (!user || !user.companyInfo) {
      console.log("Company info not found for user:", userId);
      return res.status(404).json({ message: "Company info not found" });
    }

    console.log("Found company info:", user.companyInfo);
    res.json({ companyInfo: user.companyInfo });
  } catch (error) {
    console.error("Error fetching company info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/company-info/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const companyData = req.body;

    const updatedCompanyInfo = await prisma.companyInfo.update({
      where: { userId },
      data: companyData,
    });

    res.json({ companyInfo: updatedCompanyInfo });
  } catch (error) {
    console.error("Error updating company info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Rota de teste para verificar se o servidor está rodando
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Auth routes
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { companyInfo: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

const ADMIN_EMAIL = "admin@admin.com.br";
const ADMIN_PASSWORD = "123";

// Adicionar rota para criar usuário inicial
app.post("/api/init", async (_req: Request, res: Response) => {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          password: hashedPassword,
          companyInfo: {
            create: {
              name: "Mecânica Rocha",
              cnpj: "41.008.040/0001-67",
              address: "Rua Eliazar Braga o-416 - CENTRO",
              phone: "(14) 99650-2602",
              email: "mecanicarocha21@gmail.com",
            },
          },
        },
        include: {
          companyInfo: true,
        },
      });
      res.json(user);
    } else {
      res.json({ message: "Admin user already exists" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error creating initial user" });
  }
});

// Service Orders routes
app.post("/api/service-orders", async (req: Request, res: Response) => {
  try {
    const { items, ...orderData } = req.body;
    console.log("Received order data:", { ...orderData, items }); // Debug log

    // Ensure date is a valid DateTime
    const date = new Date(orderData.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Data inválida" });
    }

    const order = await prisma.serviceOrder.create({
      data: {
        client: orderData.client,
        date: date,
        fleet: orderData.fleet,
        farm: orderData.farm || "",
        description: orderData.description || "",
        total: Number(orderData.total),
        userId: orderData.userId,
        items: {
          create: items.map((item: any) => ({
            quantity: Number(item.quantity),
            description: item.description,
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
          })),
        },
      },
      include: {
        items: true,
        user: {
          include: {
            companyInfo: true,
          },
        },
      },
    });

    console.log("Created order:", order); // Debug log
    res.json(order);
  } catch (error) {
    console.error("Erro detalhado ao criar ordem de serviço:", error);
    res.status(500).json({
      error: "Erro ao criar ordem de serviço",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/api/service-orders", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.json([]); // Retorna array vazio se não houver userId
    }

    const orders = await prisma.serviceOrder.findMany({
      where: { userId: String(userId) },
      include: {
        items: true,
        user: {
          include: {
            companyInfo: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders || []); // Garante que sempre retorna um array
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Erro ao buscar ordens de serviço" });
  }
});

app.delete("/api/service-orders/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Primeiro deletar os items relacionados
    await prisma.serviceItem.deleteMany({
      where: { orderId: id },
    });

    // Depois deletar a ordem
    await prisma.serviceOrder.delete({
      where: { id },
    });

    res.json({ message: "Ordem de serviço deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar ordem de serviço:", error);
    res.status(500).json({
      error: "Erro ao deletar ordem de serviço",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Dashboard routes
app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const stats = await prisma.$transaction([
      prisma.serviceOrder.count({ where: { userId: String(userId) } }),
      prisma.serviceOrder.aggregate({
        where: { userId: String(userId) },
        _sum: { total: true },
      }),
    ]);

    res.json({
      totalOrders: stats[0],
      totalRevenue: stats[1]._sum.total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// Melhor tratamento de erros
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3001;

// Wrap the server startup in an async function to handle any initialization
const startServer = async () => {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(
        `Healthcheck disponível em: http://localhost:${PORT}/api/healthcheck`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
