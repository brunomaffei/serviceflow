import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("Servidor não está rodando ou inacessível");
      return Promise.reject(
        new Error(
          "Servidor não está respondendo. Verifique se o servidor está rodando."
        )
      );
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  async initializeAdmin() {
    try {
      await api.post("/init");
    } catch (error) {
      console.log("Admin already exists or error:", error);
    }
  },

  async login(email: string, password: string) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async createServiceOrder(orderData: any) {
    const { data } = await api.post("/service-orders", orderData);
    return data;
  },

  async getServiceOrders(userId: string) {
    try {
      const { data } = await api.get(`/service-orders?userId=${userId}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  async getDashboardStats(userId: string) {
    const { data } = await api.get(`/dashboard/stats?userId=${userId}`);
    return data;
  },

  async updateCompanyInfo(userId: string, companyData: any) {
    const { data } = await api.put(`/company-info/${userId}`, companyData);
    return data;
  },

  async getCompanyInfo(userId: string) {
    try {
      const { data } = await api.get(`/company-info/${userId}`);
      console.log(data, "@@DATA");
      return data.companyInfo;
    } catch (error) {
      console.error("Error fetching company info:", error);
      throw error;
    }
  },

  async deleteServiceOrder(orderId: string) {
    const { data } = await api.delete(`/service-orders/${orderId}`);
    return data;
  },
};
