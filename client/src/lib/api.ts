const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

// Helper para obter token do localStorage ou contexto
function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

// Helper para fazer requisições autenticadas
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Se a resposta for 204 (No Content), retorna void
  if (response.status === 204) {
    return undefined as T;
  }

  // Verifica se há conteúdo antes de fazer parse
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const text = await response.text();
    return text ? JSON.parse(text) : undefined as T;
  }

  return undefined as T;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// Stores
export const storesApi = {
  list: () => apiRequest<any[]>("/stores"),
  get: (id: number) => apiRequest<any>(`/stores/${id}`),
  create: (data: any) =>
    apiRequest<any>("/stores", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest<any>(`/stores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/stores/${id}`, {
      method: "DELETE",
    }),
};

// Suppliers
export const suppliersApi = {
  list: () => apiRequest<any[]>("/suppliers"),
  get: (id: number) => apiRequest<any>(`/suppliers/${id}`),
  create: (data: any) =>
    apiRequest<any>("/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest<any>(`/suppliers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/suppliers/${id}`, {
      method: "DELETE",
    }),
};

// Products
export const productsApi = {
  list: (supplierId?: number) => {
    const url = supplierId ? `/products?supplier_id=${supplierId}` : "/products";
    return apiRequest<any[]>(url);
  },
  get: (id: number) => apiRequest<any>(`/products/${id}`),
  create: (data: any) =>
    apiRequest<any>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest<any>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/products/${id}`, {
      method: "DELETE",
    }),
};

// Campaigns
export const campaignsApi = {
  list: (supplierId?: number) => {
    const url = supplierId ? `/campaigns?supplier_id=${supplierId}` : "/campaigns";
    return apiRequest<any[]>(url);
  },
  get: (id: number) => apiRequest<any>(`/campaigns/${id}`),
  create: (data: any) =>
    apiRequest<any>("/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest<any>(`/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/campaigns/${id}`, {
      method: "DELETE",
    }),
  checkGoal: (id: number) => apiRequest<any>(`/campaigns/${id}/check-meta`),
  getProducts: async (id: number) => {
    // Buscar produtos através dos campaign_products
    const campaign = await apiRequest<any>(`/campaigns/${id}`);
    // Retornar IDs dos produtos - os produtos completos serão buscados separadamente
    return campaign.products || [];
  },
};

// Orders
export const ordersApi = {
  list: () => apiRequest<any[]>("/orders"),
  get: (id: number) => apiRequest<any>(`/orders/${id}`),
  create: (data: any) =>
    apiRequest<any>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (id: number, status: string) =>
    apiRequest<any>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getItems: (id: number) => apiRequest<any[]>(`/orders/${id}/items`),
};

// Cashback
export const cashbackApi = {
  list: () => apiRequest<any[]>("/cashback"),
  confirm: (id: number) =>
    apiRequest<any>(`/cashback/${id}/confirm`, {
      method: "PATCH",
    }),
  uploadProof: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/cashback/${id}/proof`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
  },
  downloadProof: (id: number) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/cashback/${id}/proof`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

// Files
export const filesApi = {
  list: (supplierId?: number) => {
    const url = supplierId ? `/files?supplier_id=${supplierId}` : "/files";
    return apiRequest<any[]>(url);
  },
  download: (id: number) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/files/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  upload: (supplierId: number, file: File, description?: string, fileType?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("supplier_id", supplierId.toString());
    if (description) formData.append("description", description);
    if (fileType) formData.append("file_type", fileType);
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/files`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
  },
  delete: (id: number) =>
    apiRequest<void>(`/files/${id}`, {
      method: "DELETE",
    }),
};

// Categories
export const categoriesApi = {
  list: () => apiRequest<any[]>("/categories"),
  create: (data: any) =>
    apiRequest<any>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Reports
export const reportsApi = {
  orders: (params?: { start_date?: string; end_date?: string; status?: string; supplier_id?: number; store_id?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, value.toString());
      });
    }
    const url = `/reports/orders${query.toString() ? `?${query.toString()}` : ""}`;
    return apiRequest<any>(url);
  },
  revenue: (params?: { start_date?: string; end_date?: string; group_by?: "supplier" | "store" }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, value.toString());
      });
    }
    const url = `/reports/revenue${query.toString() ? `?${query.toString()}` : ""}`;
    return apiRequest<any>(url);
  },
  cashback: (params?: { start_date?: string; end_date?: string; store_id?: number; confirmed?: boolean }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, value.toString());
      });
    }
    const url = `/reports/cashback${query.toString() ? `?${query.toString()}` : ""}`;
    return apiRequest<any>(url);
  },
};

// Withdrawals
export const withdrawalsApi = {
  list: () => apiRequest<any[]>("/withdrawals"),
  request: (data: { store_id: number; pix_key: string; amount: number }) =>
    apiRequest<any>("/withdrawals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (id: number, status: string) =>
    apiRequest<any>(`/withdrawals/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// State Conditions
export const stateConditionsApi = {
  list: (supplierId?: number) => {
    const url = supplierId ? `/state-conditions?supplier_id=${supplierId}` : "/state-conditions";
    return apiRequest<any[]>(url);
  },
  create: (data: any) =>
    apiRequest<any>("/state-conditions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest<any>(`/state-conditions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/state-conditions/${id}`, {
      method: "DELETE",
    }),
};

