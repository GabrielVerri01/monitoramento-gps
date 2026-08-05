import {
  MULTIPORTAL_CONFIG,
  VeiculoMultiportal,
  PosicaoMultiportal,
  VeiculoComPosicao,
} from "./config";

// Construir headers com autenticação
function getHeaders(): Record<string, string> {
  const { token, headerName, bearerPrefix } = MULTIPORTAL_CONFIG.auth;

  if (!token) {
    throw new Error("MULTIPORTAL_TOKEN não configurado");
  }

  return {
    "Content-Type": "application/json",
    [headerName]: `${bearerPrefix} ${token}`,
  };
}

// Construir URL com query params
function buildUrl(
  baseUrl: string,
  defaultParams: string,
  customParams?: Record<string, any>
): URL {
  const url = new URL(baseUrl);

  // Adicionar query params padrão
  if (defaultParams) {
    const params = new URLSearchParams(defaultParams);
    params.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }

  // Adicionar query params customizados
  if (customParams) {
    Object.entries(customParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url;
}

// Extrair lista da resposta (compatível com diferentes formatos)
async function extrairLista(response: Response): Promise<any[]> {
  const json = await response.json();

  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.result)) return json.result;
  if (Array.isArray(json?.retorno)) return json.retorno;
  if (Array.isArray(json?.veiculos)) return json.veiculos;
  if (Array.isArray(json?.posicoes)) return json.posicoes;

  console.error("Formato de resposta inesperado da Multiportal:", json);
  throw new Error("Formato de resposta inesperado da Multiportal");
}

export async function listarVeiculos(
  filtros?: Record<string, any>
): Promise<VeiculoMultiportal[]> {
  const config = MULTIPORTAL_CONFIG;

  if (!config.endpoints.veiculos) {
    throw new Error("MULTIPORTAL_GET_VEICULOS_URL não configurado");
  }

  const url = buildUrl(
    config.endpoints.veiculos,
    config.queryParams.veiculos,
    filtros
  );

  console.log(`[GET] ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar veículos (${response.status}) - ${response.statusText}`
    );
  }

  return extrairLista(response);
}

// ============================================
// GET Posições (transformação POST → GET)
// ============================================
export async function listarUltimasPosicoes(
  filtros?: Record<string, any>
): Promise<PosicaoMultiportal[]> {
  const config = MULTIPORTAL_CONFIG;

  if (!config.endpoints.posicoes) {
    throw new Error("MULTIPORTAL_GET_POSICOES_URL não configurado");
  }

  const url = buildUrl(
    config.endpoints.posicoes,
    config.queryParams.posicoes,
    filtros
  );

  console.log(`[GET] ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar posições (${response.status}) - ${response.statusText}`
    );
  }

  return extrairLista(response);
}

// ============================================
// Combinar Veículos + Posições (mantém compatibilidade)
// ============================================
export async function listarVeiculosComPosicao(
  filtros?: Record<string, any>
): Promise<VeiculoComPosicao[]> {
  const [veiculos, posicoes] = await Promise.all([
    listarVeiculos(filtros),
    listarUltimasPosicoes(filtros),
  ]);

  // Mapear posições por veiculoId
  const posicaoPorVeiculo = new Map(
    posicoes.map((p) => [p.veiculoId, p])
  );

  // Combinar dados de veículos com suas posições
  return veiculos.map((veiculo) => {
    const posicao = posicaoPorVeiculo.get(veiculo.id);
    return {
      ...veiculo,
      lat: posicao?.latitude ?? null,
      lng: posicao?.longitude ?? null,
    };
  });
}

// ============================================
// Funções auxiliares adicionais
// ============================================

/**
 * Buscar veículos de um setor específico
 */
export async function listarVeiculosPorSetor(
  setor: string
): Promise<VeiculoMultiportal[]> {
  return listarVeiculos({ setor });
}

/**
 * Buscar veículos com filtros múltiplos
 */
export async function buscarVeiculosComFiltros(params: {
  setor?: string;
  status?: "ativo" | "inativo" | "manutencao";
  limite?: number;
  offset?: number;
}): Promise<VeiculoComPosicao[]> {
  return listarVeiculosComPosicao(params);
}

/**
 * Histórico de rotas (quando disponível na API)
 */
export async function obterHistoricoRota(
  veiculoId: string,
  dataInicio: string,
  dataFim: string
): Promise<PosicaoMultiportal[]> {
  const filtros = {
    veiculoId,
    dataInicio,
    dataFim,
  };

  return listarUltimasPosicoes(filtros);
}

/**
 * Validar configuração antes de usar
 */
export function validarConfiguracao(): { valid: boolean; errors: string[] } {
  return MULTIPORTAL_CONFIG.validate();
}
