// ============================================
// MAIN EXPORT - RastroSystem Integration
// ============================================

// Config
export { RASTROSYSTEM_CONFIG } from "./config";

// Types
export type {
  AuthTokenResponse,
  ClienteRequest,
  ClienteResponse,
  ClienteListaResponse,
  Endereco,
  VeiculoV02Request,
  VeiculoV02Response,
  VeiculoListaV02Response,
  VeiculoV01Request,
  VeiculoClienteVinculo,
  VeiculoClienteListaResponse,
  EquipamentoVersao,
  EquipamentoVersaoListaResponse,
  ChipRequest,
  ChipResponse,
  ChipListaResponse,
  EquipamentoRequest,
  EquipamentoResponse,
  EquipamentoListaResponse,
  ErroResponse,
  PaginacaoParams,
} from "./types";

// Client
export { fazerRequisicao, validarConfiguracao, testarConexao } from "./client";

// Clientes
export {
  criarCliente,
  atualizarCliente,
  listarClientes,
  obterClientePorId,
  obterClientePorCnpj,
  deletarCliente,
  ativarCliente,
  desativarCliente,
  type FiltrosCliente,
} from "./clientes";

// Veículos
export {
  criarVeiculoV02,
  atualizarVeiculoV02,
  listarVeiculosV02,
  obterVeiculoV02PorId,
  obterVeiculoV02PorPlaca,
  deletarVeiculoV02,
  reativarVeiculoV01,
  suspenderVeiculoV01,
  trocarEquipamentoVeiculoV01,
  listarVinculosVeiculoCliente,
  vincularClienteAoVeiculo,
  ativarVeiculoV02,
  inativarVeiculoV02,
  marcarInadimplenteVeiculoV02,
  type FiltrosVeiculoV02,
  type FiltrosVinculoVeiculoCliente,
  type TrocarEquipamentoData,
} from "./veiculos";

// Equipamentos
export {
  listarVersoesEquipamento,
  obterVersaoEquipamento,
  criarChip,
  atualizarChip,
  listarChips,
  obterChipPorNumero,
  deletarChip,
  criarEquipamento,
  atualizarEquipamento,
  listarEquipamentos,
  obterEquipamentoPorModulo,
  deletarEquipamento,
  type FiltrosVersao,
  type FiltrosChip,
  type FiltrosEquipamento,
} from "./equipamentos";
