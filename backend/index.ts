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
      "https://serviceflow-9t5a.vercel.app",
      "https://serviceflow-9t5a-g8u5w7udu-bruno-arantes-maffeis-projects.vercel.app",
      "http://localhost:3001",
      "http://localhost:5173",
      "*",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Rota inicial retornar um html com uma mensagem
app.get("/", (_req: Request, res: Response) => {
  res.send(`
    <h1>API de ordens de serviço</h1>
    <p>Para acessar a API, utilize o endpoint /api</p>
  `);
});

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
    return res.json({ companyInfo: user.companyInfo });
  } catch (error) {
    console.error("Error fetching company info:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    return res.json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
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

    return res.json(order);
  } catch (error) {
    console.error("Erro detalhado ao criar ordem de serviço:", error);
    return res.status(500).json({
      error: "Erro ao criar ordem de serviço",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/api/service-orders", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.json([]);
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

    return res.json(orders || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Erro ao buscar ordens de serviço" });
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

// Products routes
app.get("/api/products", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Add new DELETE endpoint for products
app.delete("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First check if the product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      error: "Error deleting product",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Clients routes
app.get("/api/clients", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Error fetching clients" });
  }
});

// Add this new route
app.post("/api/clients", async (req: Request, res: Response) => {
  try {
    const clientData = req.body;
    console.log("Received client data in backend:", {
      ...clientData,
      userId: clientData.userId,
    });

    // Validate required fields
    const requiredFields = ["name", "type", "document", "userId"];
    const missingFields = requiredFields.filter((field) => !clientData[field]);

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      return res.status(400).json({
        error: "Missing required fields",
        details: `Missing: ${missingFields.join(", ")}`,
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: clientData.userId },
    });

    if (!userExists) {
      return res.status(404).json({
        error: "Invalid user",
        details: `User with ID ${clientData.userId} not found`,
      });
    }

    const newClient = await prisma.client.create({
      data: {
        name: clientData.name,
        type: clientData.type,
        document: clientData.document,
        email: clientData.email || null,
        phone: clientData.phone || null,
        address: clientData.address || null,
        city: clientData.city || null,
        state: clientData.state || null,
        companyName: clientData.companyName || null,
        tradingName: clientData.tradingName || null,
        stateRegistration: clientData.stateRegistration || null,
        userId: clientData.userId,
      },
    });

    return res.status(201).json(newClient);
  } catch (error) {
    console.error("Detailed error creating client:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      error: "Error creating client",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.delete("/api/clients/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First check if the client exists
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Delete the client
    await prisma.client.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return res.status(500).json({
      error: "Error deleting client",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Users routes
app.get("/api/users/list", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true,
        companyInfo: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

app.delete("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const adminId = req.headers["admin-id"] as string;

    if (!adminId) {
      return res.status(401).json({ error: "Admin ID is required" });
    }

    // Delete related records first
    await prisma.$transaction(async (prisma: any) => {
      // Delete related service items
      await prisma.serviceItem.deleteMany({
        where: {
          order: {
            userId: userId,
          },
        },
      });

      // Delete service orders
      await prisma.serviceOrder.deleteMany({
        where: { userId: userId },
      });

      // Delete company info
      await prisma.companyInfo.deleteMany({
        where: { userId: userId },
      });

      // Delete clients
      await prisma.client.deleteMany({
        where: { userId: userId },
      });

      // Finally delete the user
      await prisma.user.delete({
        where: { id: userId },
      });
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Melhor tratamento de erros
app.use((err: Error, _req: Request, res: Response) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(
    `Healthcheck disponível em: http://localhost:${PORT}/api/healthcheck`
  );
});

export default app;
