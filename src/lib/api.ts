import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";

export const api = {
  // Autenticação
  async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          companyInfo: true,
        },
      });

      if (!user) return null;

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return null;

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Erro ao realizar login");
    }
  },

  // Usuários
  async createUser(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      include: {
        companyInfo: true,
      },
    });
  },

  async updateUser(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        companyInfo: true,
      },
    });
  },

  async createInitialUser() {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const user = await prisma.user.create({
        data: {
          email: "admin@example.com",
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

      console.log("Admin user created:", user);
    }
  },

  // Informações da Empresa
  async updateCompanyInfo(userId: string, data: any) {
    return await prisma.companyInfo.upsert({
      where: {
        userId,
      },
      update: data,
      create: {
        ...(data as any),
        user: {
          connect: { id: userId },
        },
      },
    });
  },

  // Ordens de Serviço
  async createServiceOrder(data: {
    date: Date;
    client: string;
    fleet: string;
    farm?: string;
    description?: string;
    total: number;
    userId: string;
    items: Array<{
      description: string;
      unitPrice: number;
      quantity: number;
    }>;
  }) {
    return await prisma.serviceOrder.create({
      data: {
        date: data.date,
        client: data.client,
        fleet: data.fleet,
        farm: data.farm,
        description: data.description,
        total: data.total,
        userId: data.userId,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            total: item.unitPrice * item.quantity,
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
  },

  async getServiceOrders(userId: string) {
    return await prisma.serviceOrder.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
        user: {
          include: {
            companyInfo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getServiceOrder(id: string) {
    return await prisma.serviceOrder.findUnique({
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
  },

  async updateServiceOrderStatus(
    id: string,
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  ) {
    return await prisma.serviceOrder.update({
      where: { id },
      data: { status },
      include: {
        items: true,
      },
    });
  },

  // Dashboard Statistics
  async getDashboardStats(userId: string) {
    const [totalOrders, monthlyOrders, totalRevenue] = await Promise.all([
      prisma.serviceOrder.count({
        where: { userId },
      }),
      prisma.serviceOrder.count({
        where: {
          userId,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.serviceOrder.aggregate({
        where: { userId },
        _sum: {
          total: true,
        },
      }),
    ]);

    const uniqueClients = await prisma.serviceOrder.findMany({
      where: { userId },
      select: { client: true },
      distinct: ["client"],
    });

    return {
      totalOrders,
      totalClientsServed: uniqueClients.length,
      monthlyOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
    };
  },
};
