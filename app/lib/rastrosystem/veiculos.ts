import { fazerRequisicao } from "./client";
import { RASTROSYSTEM_CONFIG } from "./config";
import {
  VeiculoV02Request,
  VeiculoV02Response,
  VeiculoListaV02Response,
  VeiculoV01Request,
  VeiculoClienteVinculo,
  VeiculoClienteListaResponse,
  PaginacaoParams,
} from "./types";

// ============================================
// VEÍCULOS V0.2 (CRUD GENÉRICO)
// ============================================

export interface FiltrosVeiculoV02 extends PaginacaoParams {
  id?: string;
  placa?: string;
  cliente?: string;
  cnpjCliente?: string;
}

export async function criarVeiculoV02(dados: VeiculoV02Request): Promise<VeiculoV02Response> {
  console.log(`[VEÍCULOS V0.2] Criando veículo: ${dados.placa}`);

  const resposta = await fazerRequisicao("POST", RASTROSYSTEM_CONFIG.endpoints.veiculosV02, {
    body: dados,
  });

  console.log(`[VEÍCULOS V0.2] Veículo criado com ID: ${resposta.id}`);
  return resposta;
}

export async function atualizarVeiculoV02(
  id: string,
  dados: VeiculoV02Request
): Promise<VeiculoV02Response> {
  console.log(`[VEÍCULOS V0.2] Atualizando veículo: ${id}`);

  const resposta = await fazerRequisicao("PUT", RASTROSYSTEM_CONFIG.endpoints.veiculosV02, {
    body: { id, ...dados },
  });

  console.log(`[VEÍCULOS V0.2] Veículo atualizado: ${id}`);
  return resposta;
}

export async function listarVeiculosV02(
  filtros?: FiltrosVeiculoV02
): Promise<VeiculoListaV02Response> {
  console.log(`[VEÍCULOS V0.2] Listando veículos`, filtros);

  const resposta = await fazerRequisicao("GET", RASTROSYSTEM_CONFIG.endpoints.veiculosV02, {
    queryParams: filtros,
  });

  console.log(`[VEÍCULOS V0.2] Encontrados ${resposta.total || 0} veículo(s)`);
  return resposta;
}

export async function obterVeiculoV02PorId(id: string): Promise<VeiculoV02Response> {
  console.log(`[VEÍCULOS V0.2] Buscando veículo: ${id}`);

  const resposta = await listarVeiculosV02({ id });

  if (!resposta.veiculos || resposta.veiculos.length === 0) {
    throw new Error(`Veículo não encontrado: ${id}`);
  }

  return resposta.veiculos[0];
}

export async function obterVeiculoV02PorPlaca(placa: string): Promise<VeiculoV02Response> {
  console.log(`[VEÍCULOS V0.2] Buscando veículo por placa: ${placa}`);

  const resposta = await listarVeiculosV02({ placa });

  if (!resposta.veiculos || resposta.veiculos.length === 0) {
    throw new Error(`Veículo não encontrado com placa: ${placa}`);
  }

  return resposta.veiculos[0];
}

export async function deletarVeiculoV02(id: string): Promise<void> {
  console.log(`[VEÍCULOS V0.2] Deletando veículo: ${id}`);

  await fazerRequisicao("DELETE", RASTROSYSTEM_CONFIG.endpoints.veiculosV02, {
    queryParams: { id_veiculo: id },
  });

  console.log(`[VEÍCULOS V0.2] Veículo deletado: ${id}`);
}

// ============================================
// VEÍCULOS V0.1 (AÇÕES ESPECÍFICAS)
// ============================================

export async function reativarVeiculoV01(dados: VeiculoV01Request): Promise<VeiculoV02Response> {
  console.log(`[VEÍCULOS V0.1] Reativando veículo: ${dados.id}`);

  const resposta = await fazerRequisicao("PUT", RASTROSYSTEM_CONFIG.endpoints.veiculosV01Reativar, {
    body: dados,
  });

  console.log(`[VEÍCULOS V0.1] Veículo reativado: ${dados.id}`);
  return resposta;
}

export async function suspenderVeiculoV01(
  id: string,
  opcao: "inadimplencia" | "retira_inadimplencia"
): Promise<void> {
  console.log(`[VEÍCULOS V0.1] ${opcao === "inadimplencia" ? "Suspendendo" : "Ativando"} veículo: ${id}`);

  const deleteParam = opcao === "retira_inadimplencia" ? "true" : "false";

  await fazerRequisicao("POST", RASTROSYSTEM_CONFIG.endpoints.veiculosV01Suspender, {
    queryParams: { id, delete: deleteParam },
  });

  console.log(`[VEÍCULOS V0.1] Veículo ${opcao}: ${id}`);
}

export interface TrocarEquipamentoData {
  id: string;
  modulo: string;
  placa: string;
  sistema: string;
}

export async function trocarEquipamentoVeiculoV01(
  dados: TrocarEquipamentoData
): Promise<void> {
  console.log(`[VEÍCULOS V0.1] Trocando equipamento do veículo: ${dados.id}`);

  await fazerRequisicao("PUT", RASTROSYSTEM_CONFIG.endpoints.veiculosV01TrocarEquipamento, {
    body: dados,
  });

  console.log(`[VEÍCULOS V0.1] Equipamento trocado: ${dados.id}`);
}

// ============================================
// VÍNCULO VEÍCULO-CLIENTE
// ============================================

export interface FiltrosVinculoVeiculoCliente extends PaginacaoParams {
  id_veiculo?: string;
  cliente?: string;
}

export async function listarVinculosVeiculoCliente(
  filtros?: FiltrosVinculoVeiculoCliente
): Promise<VeiculoClienteListaResponse> {
  console.log(`[VEÍCULOS V0.1] Listando vínculos veículo-cliente`, filtros);

  const resposta = await fazerRequisicao("GET", RASTROSYSTEM_CONFIG.endpoints.veiculosV01Clientes, {
    queryParams: filtros,
  });

  console.log(`[VEÍCULOS V0.1] Encontrados ${resposta.total || 0} vínculo(s)`);
  return resposta;
}

export async function vincularClienteAoVeiculo(
  id_veiculo: string,
  cliente: string
): Promise<VeiculoClienteVinculo> {
  console.log(`[VEÍCULOS V0.1] Vinculando cliente ${cliente} ao veículo ${id_veiculo}`);

  const resposta = await fazerRequisicao(
    "POST",
    RASTROSYSTEM_CONFIG.endpoints.veiculosV01VincularCliente,
    {
      queryParams: { id_veiculo, cliente },
    }
  );

  console.log(`[VEÍCULOS V0.1] Vínculo criado com sucesso`);
  return resposta;
}

// ============================================
// AÇÕES DE STATUS
// ============================================

export async function ativarVeiculoV02(id: string): Promise<VeiculoV02Response> {
  console.log(`[VEÍCULOS V0.2] Ativando veículo: ${id}`);

  const veiculo = await obterVeiculoV02PorId(id);
  return atualizarVeiculoV02(id, {
    ...veiculo,
    status: "ativo",
  });
}

export async function inativarVeiculoV02(id: string): Promise<VeiculoV02Response> {
  console.log(`[VEÍCULOS V0.2] Inativando veículo: ${id}`);

  const veiculo = await obterVeiculoV02PorId(id);
  return atualizarVeiculoV02(id, {
    ...veiculo,
    status: "inativo",
  });
}

export async function marcarInadimplenteVeiculoV02(id: string): Promise<VeiculoV02Response> {
  console.log(`[VEÍCULOS V0.2] Marcando veículo como inadimplente: ${id}`);

  const veiculo = await obterVeiculoV02PorId(id);
  return atualizarVeiculoV02(id, {
    ...veiculo,
    status: "inadimplente",
  });
}
