// Configurações centralizadas para a API Multiportal
export const MULTIPORTAL_CONFIG = {
  // Endpoints GET
  endpoints: {
    veiculos: process.env.MULTIPORTAL_GET_VEICULOS_URL || "",
    posicoes: process.env.MULTIPORTAL_GET_POSICOES_URL || "",
  },

  // Query params padrão
  queryParams: {
    veiculos: process.env.MULTIPORTAL_VEICULOS_QUERY_PARAMS || "",
    posicoes: process.env.MULTIPORTAL_POSICOES_QUERY_PARAMS || "limite=100",
  },

  // Autenticação
  auth: {
    token: process.env.MULTIPORTAL_TOKEN || "",
    headerName: process.env.MULTIPORTAL_AUTH_HEADER || "Authorization",
    bearerPrefix: "Bearer", // Ajuste se necessário (Bearer, Token, etc)
  },

  // Validações
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.endpoints.veiculos) {
      errors.push("MULTIPORTAL_GET_VEICULOS_URL não configurado");
    }
    if (!this.endpoints.posicoes) {
      errors.push("MULTIPORTAL_GET_POSICOES_URL não configurado");
    }
    if (!this.auth.token) {
      errors.push("MULTIPORTAL_TOKEN não configurado");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// Interfaces de tipos
export interface VeiculoMultiportal {
  id: string;
  placa?: string;
  nome?: string;
  setor?: string;
  status?: string;
  [key: string]: unknown;
}

export interface PosicaoMultiportal {
  veiculoId: string;
  latitude: number;
  longitude: number;
  dataHora?: string;
  velocidade?: number;
  [key: string]: unknown;
}

export interface VeiculoComPosicao extends VeiculoMultiportal {
  lat: number | null;
  lng: number | null;
  aparelhos?: string[];
}
