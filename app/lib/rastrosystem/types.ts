// ============================================
// AUTENTICAÇÃO
// ============================================

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
}

// ============================================
// CLIENTES
// ============================================

export interface Endereco {
  logradouro: string;
  numero: string;
  cep: string;
  cidade: string;
  uf: string;
  complemento?: string;
  bairro: string;
}

export interface ClienteRequest {
  id: string;
  nome: string;
  sistema: string;
  ativo: "Y" | "N";
  cnpj: string;
  email: string;
  endereco: Endereco;
  tel?: string;
  cel?: string;
  cel2?: string;
}

export interface ClienteResponse extends ClienteRequest {
  id: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
}

export interface ClienteListaResponse {
  clientes: ClienteResponse[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================
// VEÍCULOS V0.2
// ============================================

export interface VeiculoV02Request {
  placa: string;
  status: "ativo" | "inativo" | "inadimplente";
  pessoa_id: string;
  imei?: string;
  marca?: string;
  modelo?: string;
  cor?: string;
  tipo?: string;
  combustivel?: string;
  chassi?: string;
  renavam?: string;
  ano?: number;
  anomodelo?: number;
}

export interface VeiculoV02Response extends VeiculoV02Request {
  id: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
}

export interface VeiculoListaV02Response {
  veiculos: VeiculoV02Response[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================
// VEÍCULOS V0.1 (AÇÕES ESPECÍFICAS)
// ============================================

export interface VeiculoV01Request {
  id: string;
  ano: number;
  anomodelo: number;
  ativo: "Y" | "N";
  chassi: string;
  modelo: string;
  marca: string;
  modulo: string;
  placa: string;
  renavam: string;
  sistema: string;
}

export interface VeiculoClienteVinculo {
  id_veiculo: string;
  cliente: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
}

export interface VeiculoClienteListaResponse {
  vinculos: VeiculoClienteVinculo[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================
// EQUIPAMENTOS
// ============================================

export interface EquipamentoVersao {
  id: string;
  modelo: string;
  versao: string;
  dataCadastro?: string;
}

export interface EquipamentoVersaoListaResponse {
  versoes: EquipamentoVersao[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChipRequest {
  numchip: string;
  celmodulo: string;
  operadora: string;
}

export interface ChipResponse extends ChipRequest {
  id: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
}

export interface ChipListaResponse {
  chips: ChipResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface EquipamentoRequest {
  modulo: string;
  id_versao: string;
  id_chip: string;
}

export interface EquipamentoResponse extends EquipamentoRequest {
  id: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
}

export interface EquipamentoListaResponse {
  equipamentos: EquipamentoResponse[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================
// RESPOSTAS DE ERRO
// ============================================

export interface ErroResponse {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

// ============================================
// QUERYPARAMS COMUNS
// ============================================

export interface PaginacaoParams {
  limit?: number;
  offset?: number;
  ordem?: string;
}
