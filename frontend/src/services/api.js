// Resolve Backend API and WebSocket URLs dynamically
const isViteDev = window.location.port === "5173";
const DEFAULT_BACKEND_HTTP = isViteDev ? "http://localhost:8000" : window.location.origin;
const DEFAULT_BACKEND_WS = isViteDev ? "localhost:8000" : window.location.host;

const BASE_URL = import.meta.env.VITE_API_BASE || DEFAULT_BACKEND_HTTP;

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/api/v1/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  },

  async getMerchants() {
    const res = await fetch(`${BASE_URL}/api/v1/merchants`);
    if (!res.ok) throw new Error(`Fetch merchants failed: ${res.status}`);
    return res.json();
  },

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

  async analyzeTransaction(payload) {
    const res = await fetch(`${BASE_URL}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Transaction analysis failed: ${res.status}`);
    return res.json();
  },

  getWebSocketUrl() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_WS_HOST || DEFAULT_BACKEND_WS;
    return `${protocol}//${host}/ws/telemetry`;
  }
};
