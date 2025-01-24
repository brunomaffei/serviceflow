import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 15000, // Increased to 15 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout - retrying...");
      try {
        // Retry the request once
        const retryConfig = {
          ...error.config,
          timeout: 30000, // Increase timeout for retry
        };
        return await api(retryConfig);
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        return Promise.reject(
          new Error("Servidor está demorando para responder. Tente novamente.")
        );
      }
    }

    if (error.code === "ERR_NETWORK") {
      return Promise.reject(
        new Error("Servidor não está respondendo. Verifique sua conexão.")
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
      const { data } = await api.get(`/service-orders?userId=${userId}`, {
        timeout: 30000, // Specific timeout for this endpoint
      });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error; // Let the component handle the error
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

  // Products methods
  async getProducts() {
    try {
      const { data } = await api.get("/products");
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async createProduct(productData: any) {
    const { data } = await api.post("/products", productData);
    return data;
  },

  async updateProduct(id: string, productData: any) {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },

  async deleteProduct(id: string) {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  // Clients methods
  async getClients(userId: string) {
    try {
      const { data } = await api.get(`/clients?userId=${userId}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
  },

  // Client methods
  async createClient(clientData: any) {
    const { data } = await api.post("/clients", clientData);
    return data;
  },

  async updateClient(id: string, clientData: any) {
    const { data } = await api.put(`/clients/${id}`, clientData);
    return data;
  },

  async deleteClient(id: string) {
    const { data } = await api.delete(`/clients/${id}`);
    return data;
  },

  async updateServiceOrder(orderData: any) {
    const { data } = await api.put(
      `/service-orders/${orderData.id}`,
      orderData
    );
    return data;
  },

  // User management methods
  async getUsers(adminId: string) {
    try {
      const { data } = await api.get("/users", {
        headers: {
          "admin-id": adminId,
          "Content-Type": "application/json",
        },
      });
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async createUser(
    userData: { email: string; password: string; role: string },
    adminId: string
  ) {
    try {
      const { data } = await api.post("/users", userData, {
        headers: {
          "admin-id": adminId,
          "Content-Type": "application/json",
        },
      });
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        // O servidor respondeu com um status de erro
        throw new Error(error.response.data.error || "Erro ao criar usuário");
      } else if (axios.isAxiosError(error) && error.request) {
        // A requisição foi feita mas não houve resposta
        throw new Error("Servidor não respondeu. Tente novamente.");
      } else {
        // Erro ao configurar a requisição
        throw new Error("Erro ao fazer a requisição");
      }
    }
  },

  async deleteUser(userId: string, adminId: string) {
    try {
      const { data } = await api.delete(`/users/${userId}`, {
        headers: {
          "admin-id": adminId,
        },
      });
      return data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};
