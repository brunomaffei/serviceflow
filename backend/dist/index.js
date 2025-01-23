"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const client_1 = require("./prisma/client");
const app = (0, express_1.default)();
// Configuração do CORS atualizada
app.use((0, cors_1.default)({
    origin: [
        "https://serviceflow-r5m9.vercel.app", // seu frontend em produção
        "http://localhost:5173", // seu frontend local
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// Middleware para logging de requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log("Headers:", req.headers);
    next();
});
app.use(express_1.default.json());
// Adicione um endpoint de teste CORS
app.options("*", (0, cors_1.default)()); // habilita pre-flight para todas as rotas
app.get("/api/test-cors", (req, res) => {
    res.json({ message: "CORS está funcionando!" });
});
// Healthcheck route
app.get("/api/healthcheck", async (_req, res) => {
    try {
        await client_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            database: "connected",
            uptime: process.uptime(),
        });
    }
    catch (error) {
        res.status(500).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            database: "disconnected",
            error: String(error),
        });
    }
});
// Company Info routes
app.get("/api/company-info/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("Fetching company info for userId:", userId);
        const user = await client_1.prisma.user.findUnique({
            where: { id: userId },
            include: { companyInfo: true },
        });
        if (!user || !user.companyInfo) {
            console.log("Company info not found for user:", userId);
            return res.status(404).json({ message: "Company info not found" });
        }
        console.log("Found company info:", user.companyInfo);
        res.json({ companyInfo: user.companyInfo });
    }
    catch (error) {
        console.error("Error fetching company info:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.put("/api/company-info/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const companyData = req.body;
        const updatedCompanyInfo = await client_1.prisma.companyInfo.update({
            where: { userId },
            data: companyData,
        });
        res.json({ companyInfo: updatedCompanyInfo });
    }
    catch (error) {
        console.error("Error updating company info:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Rota de teste para verificar se o servidor está rodando
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});
// Auth routes
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await client_1.prisma.user.findUnique({
            where: { email },
            include: { companyInfo: true },
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json(userWithoutPassword);
    }
    catch (error) {
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
const ADMIN_EMAIL = "admin@admin.com.br";
const ADMIN_PASSWORD = "123";
// Adicionar rota para criar usuário inicial
app.post("/api/init", async (_req, res) => {
    try {
        const existingAdmin = await client_1.prisma.user.findUnique({
            where: { email: ADMIN_EMAIL },
        });
        if (!existingAdmin) {
            const hashedPassword = await bcryptjs_1.default.hash(ADMIN_PASSWORD, 10);
            const user = await client_1.prisma.user.create({
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
        }
        else {
            res.json({ message: "Admin user already exists" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Error creating initial user" });
    }
});
// Service Orders routes
app.post("/api/service-orders", async (req, res) => {
    try {
        const _a = req.body, { items } = _a, orderData = __rest(_a, ["items"]);
        console.log("Received order data:", Object.assign(Object.assign({}, orderData), { items })); // Debug log
        // Ensure date is a valid DateTime
        const date = new Date(orderData.date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: "Data inválida" });
        }
        const order = await client_1.prisma.serviceOrder.create({
            data: {
                client: orderData.client,
                date: date,
                fleet: orderData.fleet,
                farm: orderData.farm || "",
                description: orderData.description || "",
                total: Number(orderData.total),
                userId: orderData.userId,
                items: {
                    create: items.map((item) => ({
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
    }
    catch (error) {
        console.error("Erro detalhado ao criar ordem de serviço:", error);
        res.status(500).json({
            error: "Erro ao criar ordem de serviço",
            details: error instanceof Error ? error.message : String(error),
        });
    }
});
app.get("/api/service-orders", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.json([]); // Retorna array vazio se não houver userId
        }
        const orders = await client_1.prisma.serviceOrder.findMany({
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
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Erro ao buscar ordens de serviço" });
    }
});
app.delete("/api/service-orders/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // Primeiro deletar os items relacionados
        await client_1.prisma.serviceItem.deleteMany({
            where: { orderId: id },
        });
        // Depois deletar a ordem
        await client_1.prisma.serviceOrder.delete({
            where: { id },
        });
        res.json({ message: "Ordem de serviço deletada com sucesso" });
    }
    catch (error) {
        console.error("Erro ao deletar ordem de serviço:", error);
        res.status(500).json({
            error: "Erro ao deletar ordem de serviço",
            details: error instanceof Error ? error.message : String(error),
        });
    }
});
// Products routes
app.post("/api/products", async (req, res) => {
    try {
        const product = await client_1.prisma.product.create({
            data: req.body,
        });
        res.json(product);
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Error creating product" });
    }
});
app.get("/api/products", async (_req, res) => {
    try {
        const products = await client_1.prisma.product.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Error fetching products" });
    }
});
app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await client_1.prisma.product.update({
            where: { id },
            data: req.body,
        });
        res.json(product);
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Error updating product" });
    }
});
app.delete("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await client_1.prisma.product.delete({
            where: { id },
        });
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Error deleting product" });
    }
});
// Dashboard routes
app.get("/api/dashboard/stats", async (req, res) => {
    try {
        const { userId } = req.query;
        const stats = await client_1.prisma.$transaction([
            client_1.prisma.serviceOrder.count({ where: { userId: String(userId) } }),
            client_1.prisma.serviceOrder.aggregate({
                where: { userId: String(userId) },
                _sum: { total: true },
            }),
        ]);
        res.json({
            totalOrders: stats[0],
            totalRevenue: stats[1]._sum.total || 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
});
// Melhor tratamento de erros
app.use((err, _req, res, _next) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
});
const PORT = process.env.PORT || 3001;
// Wrap the server startup in an async function to handle any initialization
const startServer = async () => {
    try {
        await client_1.prisma.$connect();
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
            console.log(`Healthcheck disponível em: http://localhost:${PORT}/api/healthcheck`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
