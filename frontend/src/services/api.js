const BASE_URL = import.meta.env.VITE_API_BASE || window.location.origin;

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/api/v1/health`);
    return res.json();
  },

  async getMerchants() {
    const res = await fetch(`${BASE_URL}/api/v1/merchants`);
    return res.json();
  },

  async startSimulation(scenario = "MIXED") {
    const res = await fetch(`${BASE_URL}/api/v1/simulate/start?scenario=${scenario}`, {
      method: "POST"
    });
    return res.json();
  },

  async stopSimulation() {
    const res = await fetch(`${BASE_URL}/api/v1/simulate/stop`, {
      method: "POST"
    });
    return res.json();
  },

  async runMysteryShop(merchantId, websiteUrl) {
    const res = await fetch(`${BASE_URL}/api/v1/mystery-shop?merchant_id=${encodeURIComponent(merchantId)}&website_url=${encodeURIComponent(websiteUrl)}`, {
      method: "POST"
    });
    return res.json();
  },

  async generateSAR(merchantId) {
    const res = await fetch(`${BASE_URL}/api/v1/sar/generate?merchant_id=${encodeURIComponent(merchantId)}`, {
      method: "POST"
    });
    return res.json();
  },

  async analyzeTransaction(payload) {
    const res = await fetch(`${BASE_URL}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getWebSocketUrl() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_WS_HOST || window.location.host;
    return `${protocol}//${host}/ws/telemetry`;
  }
};
