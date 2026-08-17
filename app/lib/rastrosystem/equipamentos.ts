import { fazerRequisicao } from "./client";
import { RASTROSYSTEM_CONFIG } from "./config";
import {
  EquipamentoVersao,
  EquipamentoVersaoListaResponse,
  ChipRequest,
  ChipResponse,
  ChipListaResponse,
  EquipamentoRequest,
  EquipamentoResponse,
  EquipamentoListaResponse,
  PaginacaoParams,
} from "./types";

// ============================================
// VERSÕES DE RASTREADORES
// ============================================

export interface FiltrosVersao extends PaginacaoParams {}

export async function listarVersoesEquipamento(
  filtros?: FiltrosVersao
): Promise<EquipamentoVersaoListaResponse> {
  console.log(`[EQUIPAMENTOS] Listando versões`, filtros);

  const resposta = await fazerRequisicao("GET", RASTROSYSTEM_CONFIG.endpoints.equipamentosVersao, {
    queryParams: filtros,
  });

  console.log(`[EQUIPAMENTOS] Encontradas ${resposta.total || 0} versão(s)`);
  return resposta;
}

export async function obterVersaoEquipamento(id: string): Promise<EquipamentoVersao> {
  console.log(`[EQUIPAMENTOS] Buscando versão: ${id}`);

  const resposta = await listarVersoesEquipamento();

  const versao = resposta.versoes?.find((v) => v.id === id);
  if (!versao) {
    throw new Error(`Versão de equipamento não encontrada: ${id}`);
  }

  return versao;
}

// ============================================
// CHIPS
// ============================================

export interface FiltrosChip extends PaginacaoParams {
  numchip?: string;
  operadora?: string;
}

export async function criarChip(dados: ChipRequest): Promise<ChipResponse> {
  console.log(`[EQUIPAMENTOS] Criando chip: ${dados.numchip}`);

  const resposta = await fazerRequisicao("POST", RASTROSYSTEM_CONFIG.endpoints.equipamentosChips, {
    body: dados,
  });

  console.log(`[EQUIPAMENTOS] Chip criado com ID: ${resposta.id}`);
  return resposta;
}

export async function atualizarChip(id: string, dados: ChipRequest): Promise<ChipResponse> {
  console.log(`[EQUIPAMENTOS] Atualizando chip: ${id}`);

  const resposta = await fazerRequisicao("PUT", RASTROSYSTEM_CONFIG.endpoints.equipamentosChips, {
    body: { id, ...dados },
  });

  console.log(`[EQUIPAMENTOS] Chip atualizado: ${id}`);
  return resposta;
}

export async function listarChips(filtros?: FiltrosChip): Promise<ChipListaResponse> {
  console.log(`[EQUIPAMENTOS] Listando chips`, filtros);

  const resposta = await fazerRequisicao("GET", RASTROSYSTEM_CONFIG.endpoints.equipamentosChips, {
    queryParams: filtros,
  });

  console.log(`[EQUIPAMENTOS] Encontrados ${resposta.total || 0} chip(s)`);
  return resposta;
}

export async function obterChipPorNumero(numchip: string): Promise<ChipResponse> {
  console.log(`[EQUIPAMENTOS] Buscando chip: ${numchip}`);

  const resposta = await listarChips({ numchip });

  if (!resposta.chips || resposta.chips.length === 0) {
    throw new Error(`Chip não encontrado: ${numchip}`);
  }

  return resposta.chips[0];
}

export async function deletarChip(id: string): Promise<void> {
  console.log(`[EQUIPAMENTOS] Deletando chip: ${id}`);

  await fazerRequisicao("DELETE", RASTROSYSTEM_CONFIG.endpoints.equipamentosChips, {
    queryParams: { id },
  });

  console.log(`[EQUIPAMENTOS] Chip deletado: ${id}`);
}

// ============================================
// EQUIPAMENTOS (RASTREADORES)
// ============================================

export interface FiltrosEquipamento extends PaginacaoParams {
  modulo?: string;
}

export async function criarEquipamento(dados: EquipamentoRequest): Promise<EquipamentoResponse> {
  console.log(`[EQUIPAMENTOS] Criando equipamento com IMEI: ${dados.modulo}`);

  const resposta = await fazerRequisicao("POST", RASTROSYSTEM_CONFIG.endpoints.equipamentos, {
    body: dados,
  });

  console.log(`[EQUIPAMENTOS] Equipamento criado com ID: ${resposta.id}`);
  return resposta;
}

export async function atualizarEquipamento(
  id: string,
  dados: EquipamentoRequest
): Promise<EquipamentoResponse> {
  console.log(`[EQUIPAMENTOS] Atualizando equipamento: ${id}`);

  const resposta = await fazerRequisicao("PUT", RASTROSYSTEM_CONFIG.endpoints.equipamentos, {
    body: { id, ...dados },
  });

  console.log(`[EQUIPAMENTOS] Equipamento atualizado: ${id}`);
  return resposta;
}

export async function listarEquipamentos(
  filtros?: FiltrosEquipamento
): Promise<EquipamentoListaResponse> {
  console.log(`[EQUIPAMENTOS] Listando equipamentos`, filtros);

  const resposta = await fazerRequisicao("GET", RASTROSYSTEM_CONFIG.endpoints.equipamentos, {
    queryParams: filtros,
  });

  console.log(`[EQUIPAMENTOS] Encontrados ${resposta.total || 0} equipamento(s)`);
  return resposta;
}

export async function obterEquipamentoPorModulo(modulo: string): Promise<EquipamentoResponse> {
  console.log(`[EQUIPAMENTOS] Buscando equipamento: ${modulo}`);

  const resposta = await listarEquipamentos({ modulo });

  if (!resposta.equipamentos || resposta.equipamentos.length === 0) {
    throw new Error(`Equipamento não encontrado com módulo/IMEI: ${modulo}`);
  }

  return resposta.equipamentos[0];
}

export async function deletarEquipamento(id: string): Promise<void> {
  console.log(`[EQUIPAMENTOS] Deletando equipamento: ${id}`);

  await fazerRequisicao("DELETE", RASTROSYSTEM_CONFIG.endpoints.equipamentos, {
    queryParams: { id },
  });

  console.log(`[EQUIPAMENTOS] Equipamento deletado: ${id}`);
}
