import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import cors from "cors";
import express, {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { prisma } from "./prisma/client";

// Definindo tipos específicos para Request e Response
type Request = ExpressRequest & {
  body: any;
  query: any;
  params: any;
};

type Response = ExpressResponse & {
  json: any;
  status: any;
};

const app = express();

// Configuração do CORS atualizada
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3001",
      "https://serviceflow-9coy.vercel.app/",
      "http://localhost:3001/api/init",
      "https://serviceflow-9coy.vercel.app", // Adicione a origem do frontend na Vercel
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "admin-id"],
    credentials: true,
  })
);

// Middleware para logging de requisições
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

app.use(express.json());

// Adicione um endpoint de teste CORS
app.options("*", cors()); // habilita pre-flight para todas as rotas

app.get("/api/test-cors", (req: Request, res: Response) => {
  res.json({ message: "CORS está funcionando!" });
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
    console.log("Iniciando criação do usuário admin...");

    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log("Admin já existe:", existingAdmin.email);
      return res.status(200).json({
        message: "Admin user already exists",
        email: existingAdmin.email,
      });
    }

    console.log("Criando novo usuário admin...");
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const user = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "ADMIN", // Corrigir o campo role para ADMIN
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

    console.log("Admin criado com sucesso:", user.email);
    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error);
    return res.status(500).json({
      error: "Error creating initial user",
      details: error instanceof Error ? error.message : String(error),
    });
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

app.put("/api/service-orders/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items, ...orderData } = req.body;

    // Primeiro, atualizar a ordem
    const updatedOrder = await prisma.serviceOrder.update({
      where: { id },
      data: {
        client: orderData.client,
        date: new Date(orderData.date),
        fleet: orderData.fleet,
        farm: orderData.farm || "",
        description: orderData.description || "",
        total: Number(orderData.total),
      },
    });

    // Depois, deletar os itens existentes
    await prisma.serviceItem.deleteMany({
      where: { orderId: id },
    });

    // Por fim, criar os novos itens
    const newItems = await prisma.serviceItem.createMany({
      data: items.map((item: any) => ({
        quantity: Number(item.quantity),
        description: item.description,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        orderId: id,
      })),
    });

    // Buscar a ordem atualizada com os novos itens
    const orderWithItems = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          include: {
            companyInfo: true,
          },
        },
      },
    });

    res.json(orderWithItems);
  } catch (error) {
    console.error("Erro ao atualizar ordem de serviço:", error);
    res.status(500).json({
      error: "Erro ao atualizar ordem de serviço",
      details: error instanceof Error ? error.message : String(error),
    });
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

// Products routes
app.post("/api/products", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Error creating product" });
  }
});

app.get("/api/products", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Error fetching products" });
  }
});

app.put("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, unit } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: String(name),
        price: Number(price),
        quantity: Math.round(Number(quantity)), // Ensure integer
        unit: unit as "UNITS" | "METERS", // Ensure correct enum type
      },
    });
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      error: "Error updating product",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.delete("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id },
    });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Error deleting product" });
  }
});

app.post("/api/clients", async (req: Request, res: Response) => {
  try {
    const clientData = req.body;

    // Detailed validation
    const requiredFields = ["type", "name", "document", "userId"];
    const missingFields = requiredFields.filter((field) => !clientData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
        received: clientData,
      });
    }

    // Validate user exists
    const userExists = await prisma.user.findUnique({
      where: { id: String(clientData.userId) },
    });

    if (!userExists) {
      return res.status(400).json({
        error: "Invalid userId",
        details: "The specified user does not exist",
        receivedUserId: clientData.userId,
      });
    }

    // Validate client type
    if (!["PF", "PJ"].includes(clientData.type)) {
      return res.status(400).json({
        error: "Invalid client type",
        details: "Type must be either 'PF' or 'PJ'",
        receivedType: clientData.type,
      });
    }

    // Create client with validated data
    const client = await prisma.client.create({
      data: {
        type: String(clientData.type),
        name: String(clientData.name),
        document: String(clientData.document),
        email: clientData.email || null,
        phone: clientData.phone || null,
        address: clientData.address || null,
        city: clientData.city || null,
        state: clientData.state || null,
        companyName: clientData.companyName || null,
        tradingName: clientData.tradingName || null,
        stateRegistration: clientData.stateRegistration || null,
        userId: String(clientData.userId),
      },
    });
    res.json(client);
  } catch (error) {
    console.error("Detailed error creating client:", error);
    res.status(500).json({
      error: "Error creating client",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/api/clients", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    const clients = await prisma.client.findMany({
      where: { userId: String(userId) },
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Error fetching clients" });
  }
});

app.put("/api/clients/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientData = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: clientData,
    });
    res.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({
      error: "Error updating client",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.delete("/api/clients/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({
      where: { id },
    });
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Error deleting client" });
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

// New endpoint for creating users (admin only)
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const adminId = req.headers["admin-id"]; // Add this header when making requests

    // Check if creator is admin
    const admin = await prisma.user.findUnique({
      where: { id: String(adminId) },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can create users" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "USER",
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

// Get all users (admin only)
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const adminId = req.headers["admin-id"];

    const admin = await prisma.user.findUnique({
      where: { id: String(adminId) },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can list users" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        companyInfo: true,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// User management routes
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const adminId = req.headers["admin-id"];

    // Verificar se o usuário é admin
    const admin = await prisma.user.findUnique({
      where: { id: String(adminId) },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem criar usuários" });
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email já está em uso" });
    }

    // Criar novo usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "USER",
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
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
