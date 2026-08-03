const MULTIPORTAL_BASE_URL =
  process.env.MULTIPORTAL_API_URL;
const MULTIPORTAL_TOKEN = process.env.MULTIPORTAL_TOKEN;

const ENDPOINTS = {
  VEICULOS: `${MULTIPORTAL_BASE_URL}/veiculos`,
  ULTIMAS_POSICOES: `${MULTIPORTAL_BASE_URL}/posicoes/ultimaPosicao`,
};

function getHeaders() {
  if (!MULTIPORTAL_TOKEN) {
    throw new Error("MULTIPORTAL_TOKEN não configurado");
  }
  return {
    "Content-Type": "application/json",
    token: MULTIPORTAL_TOKEN,
  };
}

export interface VeiculoMultiportal {
  id: string;
  placa?: string;
  nome?: string;
  [key: string]: unknown;
}

export interface PosicaoMultiportal {
  veiculoId: string; 
  latitude: number;
  longitude: number;
  dataHora?: string;
  [key: string]: unknown;
}

async function extrairLista(response: Response): Promise<any[]> {
  const json = await response.json();

  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.result)) return json.result;
  if (Array.isArray(json?.retorno)) return json.retorno;

  console.error("Formato de resposta inesperado da Multiportal:", json);
  throw new Error("Formato de resposta inesperado da Multiportal");
}

export async function listarVeiculos(): Promise<VeiculoMultiportal[]> {
  const response = await fetch(ENDPOINTS.VEICULOS, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar veículos (${response.status})`);
  }

  return extrairLista(response);
}

export async function listarUltimasPosicoes(): Promise<PosicaoMultiportal[]> {
  const response = await fetch(ENDPOINTS.ULTIMAS_POSICOES, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar posições (${response.status})`);
  }

  return extrairLista(response);
}

export async function listarVeiculosComPosicao() {
  const [veiculos, posicoes] = await Promise.all([
    listarVeiculos(),
    listarUltimasPosicoes(),
  ]);

  const posicaoPorVeiculo = new Map(
    posicoes.map((p) => [p.veiculoId, p])
  );

  return veiculos.map((veiculo) => {
    const posicao = posicaoPorVeiculo.get(veiculo.id);
    return {
      ...veiculo,
      lat: posicao?.latitude ?? null,
      lng: posicao?.longitude ?? null,
    };
  });
}