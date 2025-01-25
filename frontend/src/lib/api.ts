const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = {
  // Autenticação
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Erro ao realizar login");
    }
  },

  // Usuários
  async createUser(data: any) {
    const response = await fetch(`${baseURL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateUser(id: string, data: any) {
    const response = await fetch(`${baseURL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Ordens de Serviço
  async createServiceOrder(data: any) {
    const response = await fetch(`${baseURL}/service-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getServiceOrders(userId: string) {
    const response = await fetch(`${baseURL}/service-orders?userId=${userId}`);
    return response.json();
  },

  async getServiceOrder(id: string) {
    const response = await fetch(`${baseURL}/service-orders/${id}`);
    return response.json();
  },

  async updateServiceOrderStatus(
    id: string,
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  ) {
    const response = await fetch(`${baseURL}/service-orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  // Dashboard Statistics
  async getDashboardStats(userId: string) {
    const response = await fetch(`${baseURL}/dashboard/stats?userId=${userId}`);
    return response.json();
  },
};
