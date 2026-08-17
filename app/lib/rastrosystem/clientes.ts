import { fazerRequisicao } from "./client";
import { RASTROSYSTEM_CONFIG } from "./config";
import { ClienteRequest, ClienteResponse, ClienteListaResponse, PaginacaoParams } from "./types";

// ============================================
// CRIAR CLIENTE
// ============================================

export async function criarCliente(dados: ClienteRequest): Promise<ClienteResponse> {
  console.log(`[CLIENTES] Criando cliente: ${dados.nome}`);

  const resposta = await fazerRequisicao("POST", RASTROSYSTEM_CONFIG.endpoints.clientes, {
    body: dados,
  });

  console.log(`[CLIENTES] Cliente criado com ID: ${resposta.id}`);
  return resposta;
}

// ============================================
// ATUALIZAR CLIENTE
// ============================================

export async function atualizarCliente(dados: ClienteRequest): Promise<ClienteResponse> {
  console.log(`[CLIENTES] Atualizando cliente: ${dados.id}`);

  const resposta = await fazerRequisicao("PUT", RASTROSYSTEM_CONFIG.endpoints.clientes, {
    body: dados,
  });

  console.log(`[CLIENTES] Cliente atualizado: ${dados.id}`);
  return resposta;
}

// ============================================
// LISTAR/CONSULTAR CLIENTES
// ============================================

export interface FiltrosCliente extends PaginacaoParams {
  id?: string;
  cnpj?: string;
}

export async function listarClientes(
  filtros?: FiltrosCliente
): Promise<ClienteListaResponse> {
  console.log(`[CLIENTES] Listando clientes`, filtros);

  const resposta = await fazerRequisicao("GET", RASTROSYSTEM_CONFIG.endpoints.clientes, {
    queryParams: filtros,
  });

  console.log(`[CLIENTES] Encontrados ${resposta.total || 0} cliente(s)`);
  return resposta;
}

export async function obterClientePorId(id: string): Promise<ClienteResponse> {
  console.log(`[CLIENTES] Buscando cliente: ${id}`);

  const resposta = await listarClientes({ id });

  if (!resposta.clientes || resposta.clientes.length === 0) {
    throw new Error(`Cliente não encontrado: ${id}`);
  }

  return resposta.clientes[0];
}

export async function obterClientePorCnpj(cnpj: string): Promise<ClienteResponse> {
  console.log(`[CLIENTES] Buscando cliente por CNPJ: ${cnpj}`);

  const resposta = await listarClientes({ cnpj });

  if (!resposta.clientes || resposta.clientes.length === 0) {
    throw new Error(`Cliente não encontrado com CNPJ: ${cnpj}`);
  }

  return resposta.clientes[0];
}

// ============================================
// DELETAR CLIENTE
// ============================================

export async function deletarCliente(id: string): Promise<void> {
  console.log(`[CLIENTES] Deletando cliente: ${id}`);

  await fazerRequisicao("DELETE", RASTROSYSTEM_CONFIG.endpoints.clientes, {
    queryParams: { id },
  });

  console.log(`[CLIENTES] Cliente deletado: ${id}`);
}

// ============================================
// ATIVAR/DESATIVAR CLIENTE
// ============================================

export async function ativarCliente(id: string): Promise<ClienteResponse> {
  console.log(`[CLIENTES] Ativando cliente: ${id}`);

  const cliente = await obterClientePorId(id);
  return atualizarCliente({
    ...cliente,
    ativo: "Y",
  });
}

export async function desativarCliente(id: string): Promise<ClienteResponse> {
  console.log(`[CLIENTES] Desativando cliente: ${id}`);

  const cliente = await obterClientePorId(id);
  return atualizarCliente({
    ...cliente,
    ativo: "N",
  });
}
