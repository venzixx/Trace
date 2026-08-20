// Resolve Backend API and WebSocket URLs dynamically
const isViteDev = window.location.port === "5173";
const DEFAULT_BACKEND_HTTP = isViteDev ? "http://localhost:8000" : window.location.origin;
const DEFAULT_BACKEND_WS = isViteDev ? "localhost:8000" : window.location.host;

const BASE_URL = import.meta.env.VITE_API_BASE || DEFAULT_BACKEND_HTTP;

function getAuthHeaders() {
  const token = localStorage.getItem("trace_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Invalid credentials");
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return { authenticated: false, user: null };
    return res.json();
  },

  // Health & AI Models
  async getHealth() {
    const res = await fetch(`${BASE_URL}/api/v1/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  },

  async getAIModels() {
    const res = await fetch(`${BASE_URL}/api/v1/ai/models`);
    if (!res.ok) throw new Error(`Fetch AI models failed: ${res.status}`);
    return res.json();
  },

  // Dynamic Merchants (SQLite DB)
  async getMerchants() {
    const res = await fetch(`${BASE_URL}/api/v1/merchants`);
    if (!res.ok) throw new Error(`Fetch merchants failed: ${res.status}`);
    return res.json();
  },

  async addMerchant(merchantData) {
    const res = await fetch(`${BASE_URL}/api/v1/merchants`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(merchantData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to add merchant" }));
      throw new Error(err.detail || "Failed to add merchant");
    }
    return res.json();
  },

  async deleteMerchant(merchantId) {
    const res = await fetch(`${BASE_URL}/api/v1/merchants/${encodeURIComponent(merchantId)}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`Delete merchant failed: ${res.status}`);
    return res.json();
  },

  // Stream Simulator
  async startSimulation(scenario = "MIXED") {
    const res = await fetch(`${BASE_URL}/api/v1/simulate/start?scenario=${encodeURIComponent(scenario)}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`Start simulation failed: ${res.status}`);
    return res.json();
  },

  async stopSimulation() {
    const res = await fetch(`${BASE_URL}/api/v1/simulate/stop`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`Stop simulation failed: ${res.status}`);
    return res.json();
  },

  // Mystery Shopper & SAR
  async runMysteryShop(merchantId, websiteUrl) {
    const res = await fetch(`${BASE_URL}/api/v1/mystery-shop?merchant_id=${encodeURIComponent(merchantId)}&website_url=${encodeURIComponent(websiteUrl)}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`Mystery shop probe failed: ${res.status}`);
    return res.json();
  },

  async generateSAR(merchantId) {
    const res = await fetch(`${BASE_URL}/api/v1/sar/generate?merchant_id=${encodeURIComponent(merchantId)}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`SAR generation failed: ${res.status}`);
    return res.json();
  },

  // Custom Transaction Evaluation
  async analyzeTransaction(payload) {
    const res = await fetch(`${BASE_URL}/api/v1/analyze`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Transaction analysis failed: ${res.status}`);
    return res.json();
  },

  async getRecordedTransactions() {
    const res = await fetch(`${BASE_URL}/api/v1/transactions`);
    if (!res.ok) throw new Error(`Fetch transactions failed: ${res.status}`);
    return res.json();
  },

  getWebSocketUrl() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_WS_HOST || DEFAULT_BACKEND_WS;
    return `${protocol}//${host}/ws/telemetry`;
  }
};
