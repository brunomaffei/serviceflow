import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Change this to false since we're not using cookies
});

// Adicione este log
console.log("API Base URL:", import.meta.env.VITE_API_URL);

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Modify response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    console.error(`❌ Error on ${error.config?.url}:`, {
      status: error.response?.status,
      message: error.message,
      code: error.code,
    });

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout - retrying...");
      try {
        // Retry the request once
        const retryConfig = {
          ...error.config,
          timeout: 30000,
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
        new Error(
          `Servidor não está respondendo (${error.config?.baseURL}). Verifique sua conexão.`
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

  login: async (email: string, password: string) => {
    // Usar a instância 'api' configurada ao invés de 'axios'
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  async createServiceOrder(orderData: any) {
    const { data } = await api.post("/service-orders", orderData);
    return data;
  },

  async getServiceOrders(userId: string) {
    try {
      const { data } = await api.get(`/service-orders?userId=${userId}`, {
        timeout: 30000,
        withCredentials: false, // Desabilita temporariamente para teste
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
      console.log("Iniciando busca de produtos...");
      const response = await api.get("/products", {
        timeout: 30000, // Aumentado para 30s
      });

      console.log("Resposta recebida:", {
        status: response.status,
        dataLength: Array.isArray(response.data)
          ? response.data.length
          : "not an array",
      });

      if (!response.data) {
        throw new Error("Nenhum dado retornado do servidor");
      }

      // Garantir que sempre retorne um array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erro detalhado:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        // Tratamento específico para erro 500
        if (error.response?.status === 500) {
          const errorMessage =
            error.response.data?.details ||
            "Erro de conexão com o banco de dados. Tente novamente em alguns minutos.";
          throw new Error(errorMessage);
        }
      }

      throw new Error("Erro ao carregar produtos. Por favor, tente novamente.");
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
      if (!adminId) {
        throw new Error("ID do administrador não fornecido");
      }

      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );

      if (currentUser.role !== "ADMIN") {
        throw new Error("Apenas administradores podem acessar esta função");
      }

      const { data } = await api.get("/users", {
        headers: {
          "admin-id": adminId,
          "Content-Type": "application/json",
        },
      });

      if (!data) {
        throw new Error("Nenhum dado retornado");
      }

      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", {
        error,
        adminId,
        response: error.response?.data,
      });
      throw new Error(error.response?.data?.error || "Erro ao buscar usuários");
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
