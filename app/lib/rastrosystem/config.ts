// ============================================
// CONFIGURAÇÃO DA API RASTROSYSTEM
// ============================================

export const RASTROSYSTEM_CONFIG = {
  baseUrl: process.env.RASTROSYSTEM_BASE_URL || "https://teste.rastrosystem.com.br/api_v3",

  // Credentials
  auth: {
    username: process.env.RASTROSYSTEM_USERNAME || "",
    password: process.env.RASTROSYSTEM_PASSWORD || "",
  },

  // Token refresh
  tokenRefreshThresholdMs: 60000, // 1 minuto antes de expirar
  maxRetries: 3,
  retryDelayMs: 1000,

  // Endpoints
  endpoints: {
    // Auth
    oauth: "/newkoauth/oauth/token",

    // Clientes
    clientes: "/v0.1/clientes/integracao",

    // Veículos V0.2
    veiculosV02: "/v0.2/veiculos",

    // Veículos V0.1 (ações específicas)
    veiculosV01Reativar: "/v0.1/veiculos/integracao/reativar",
    veiculosV01Suspender: "/v0.1/veiculos/integracao/suspender",
    veiculosV01TrocarEquipamento: "/v0.1/veiculos/integracao/trocarEquipamento",
    veiculosV01Clientes: "/v0.1/veiculos/clientes/integracao",
    veiculosV01VincularCliente: "/v0.1/veiculos/integracao/vincularClienteById",

    // Equipamentos
    equipamentosVersao: "/v0.1/equipamentos/versao",
    equipamentosChips: "/v0.1/equipamentos/chips",
    equipamentos: "/v0.1/equipamentos/integracao",
  },

  // Validações
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.baseUrl) {
      errors.push("RASTROSYSTEM_BASE_URL não configurado");
    }
    if (!this.auth.username) {
      errors.push("RASTROSYSTEM_USERNAME não configurado");
    }
    if (!this.auth.password) {
      errors.push("RASTROSYSTEM_PASSWORD não configurado");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
