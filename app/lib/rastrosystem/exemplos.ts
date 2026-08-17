/**
 * Exemplos de Uso da Integração RastroSystem
 *
 * Este arquivo contém exemplos práticos de como usar a integração
 * RastroSystem em diferentes contextos da aplicação.
 */

// ============================================
// IMPORTAÇÕES
// ============================================

import * as rastroSystem from "@/app/lib/rastrosystem";
import type {
  ClienteRequest,
  VeiculoV02Request,
  ChipRequest,
  EquipamentoRequest,
} from "@/app/lib/rastrosystem";

// ============================================
// EXEMPLO 1: VERIFICAR INTEGRAÇÃO
// ============================================

export async function verificarIntegracao() {
  try {
    const validacao = await rastroSystem.validarConfiguracao();

    if (!validacao.valid) {
      console.error("Configuração incompleta:", validacao.errors);
      return false;
    }

    const ok = await rastroSystem.testarConexao();
    if (ok) {
      console.log("✓ RastroSystem integrado com sucesso!");
    }

    return ok;
  } catch (erro) {
    console.error("Erro ao verificar integração:", erro);
    return false;
  }
}

// ============================================
// EXEMPLO 2: CRIAR CLIENTE COMPLETO
// ============================================

export async function criarClienteCompleto() {
  const novoCliente: ClienteRequest = {
    id: `CLI-${Date.now()}`,
    nome: "Empresa Logística XYZ",
    sistema: "GPS-Rastreamento",
    ativo: "Y",
    cnpj: "12.345.678/0001-90",
    email: "contato@empresa-xyz.com.br",
    endereco: {
      logradouro: "Avenida Paulista",
      numero: "1000",
      cep: "01311-100",
      cidade: "São Paulo",
      uf: "SP",
      bairro: "Bela Vista",
      complemento: "Sala 1500",
    },
    tel: "1133334444",
    cel: "11999998888",
    cel2: "11999997777",
  };

  try {
    const cliente = await rastroSystem.criarCliente(novoCliente);
    console.log("Cliente criado:", cliente);
    return cliente;
  } catch (erro) {
    console.error("Erro ao criar cliente:", erro);
    throw erro;
  }
}

// ============================================
// EXEMPLO 3: CRIAR VEÍCULO E VINCULAR A CLIENTE
// ============================================

export async function criarVeiculoComVinculo(clienteId: string) {
  const novoVeiculo: VeiculoV02Request = {
    placa: `ABC${Math.floor(Math.random() * 10000)}`.toUpperCase(),
    status: "ativo",
    pessoa_id: clienteId,
    marca: "Ford",
    modelo: "Transit",
    cor: "Branco",
    tipo: "Furgão",
    combustivel: "Diesel",
    ano: 2023,
    anomodelo: 2023,
    imei: `${Date.now()}`.substring(0, 15),
  };

  try {
    // 1. Criar veículo
    const veiculo = await rastroSystem.criarVeiculoV02(novoVeiculo);
    console.log("Veículo criado:", veiculo);

    // 2. Vincular cliente (se necessário via V0.1)
    await rastroSystem.vincularClienteAoVeiculo(veiculo.id, clienteId);
    console.log("Cliente vinculado ao veículo");

    return veiculo;
  } catch (erro) {
    console.error("Erro ao criar veículo:", erro);
    throw erro;
  }
}

// ============================================
// EXEMPLO 4: CRIAR EQUIPAMENTO COM CHIP
// ============================================

export async function criarEquipamentoComChip() {
  try {
    // 1. Criar chip
    const chip: ChipRequest = {
      numchip: `558521${Math.floor(Math.random() * 1000000000)}`,
      celmodulo: `${Date.now()}`.substring(0, 15),
      operadora: "Vivo",
    };

    const chipCriado = await rastroSystem.criarChip(chip);
    console.log("Chip criado:", chipCriado);

    // 2. Listar versões disponíveis
    const versoes = await rastroSystem.listarVersoesEquipamento({ limit: 10 });
    const versaoId = versoes.versoes[0]?.id;

    if (!versaoId) {
      throw new Error("Nenhuma versão de equipamento disponível");
    }

    // 3. Criar equipamento
    const equipamento: EquipamentoRequest = {
      modulo: `${Date.now()}`.substring(0, 15), // IMEI
      id_versao: versaoId,
      id_chip: chipCriado.id,
    };

    const equipamentoCriado = await rastroSystem.criarEquipamento(equipamento);
    console.log("Equipamento criado:", equipamentoCriado);

    return { chip: chipCriado, equipamento: equipamentoCriado };
  } catch (erro) {
    console.error("Erro ao criar equipamento com chip:", erro);
    throw erro;
  }
}

// ============================================
// EXEMPLO 5: LISTAR E FILTRAR VEÍCULOS
// ============================================

export async function listarVeiculosComFiltros(filtros?: {
  placa?: string;
  cliente?: string;
  status?: string;
}) {
  try {
    const resultado = await rastroSystem.listarVeiculosV02({
      placa: filtros?.placa,
      cliente: filtros?.cliente,
      limit: 20,
      offset: 0,
      ordem: "placa",
    });

    console.log(`Total de veículos: ${resultado.total}`);
    console.log("Veículos encontrados:", resultado.veiculos);

    // Filtrar por status se fornecido
    if (filtros?.status) {
      const filtrados = resultado.veiculos.filter((v) => v.status === filtros.status);
      return filtrados;
    }

    return resultado.veiculos;
  } catch (erro) {
    console.error("Erro ao listar veículos:", erro);
    throw erro;
  }
}

// ============================================
// EXEMPLO 6: ATUALIZAR STATUS DE VEÍCULO
// ============================================

export async function atualizarStatusVeiculo(
  veiculoId: string,
  novoStatus: "ativo" | "inativo" | "inadimplente"
) {
  try {
    const veiculo = await rastroSystem.obterVeiculoV02PorId(veiculoId);

    let resultado;
    switch (novoStatus) {
      case "ativo":
        resultado = await rastroSystem.ativarVeiculoV02(veiculoId);
        break;
      case "inativo":
        resultado = await rastroSystem.inativarVeiculoV02(veiculoId);
        break;
      case "inadimplente":
        resultado = await rastroSystem.marcarInadimplenteVeiculoV02(veiculoId);
        break;
    }

    console.log(`Veículo ${veiculoId} agora está: ${novoStatus}`);
    return resultado;
  } catch (erro) {
    console.error(`Erro ao atualizar status do veículo: ${erro}`);
    throw erro;
  }
}

// ============================================
// EXEMPLO 7: OPERAÇÕES EM LOTE
// ============================================

export async function criarMultiplosClientes(quantidade: number) {
  const clientes = [];

  try {
    for (let i = 0; i < quantidade; i++) {
      const cliente: ClienteRequest = {
        id: `CLI-BATCH-${i + 1}`,
        nome: `Empresa Teste ${i + 1}`,
        sistema: "GPS",
        ativo: "Y",
        cnpj: `${String(i + 1).padStart(2, "0")}.345.678/0001-90`,
        email: `empresa${i + 1}@teste.com.br`,
        endereco: {
          logradouro: "Rua Teste",
          numero: String(i + 1),
          cep: "12345-678",
          cidade: "São Paulo",
          uf: "SP",
          bairro: "Centro",
        },
      };

      try {
        const criado = await rastroSystem.criarCliente(cliente);
        clientes.push(criado);
        console.log(`✓ Cliente ${i + 1}/${quantidade} criado`);
      } catch (erro) {
        console.warn(`✗ Erro ao criar cliente ${i + 1}: ${erro}`);
      }
    }

    console.log(`Criados ${clientes.length}/${quantidade} clientes`);
    return clientes;
  } catch (erro) {
    console.error("Erro ao criar clientes em lote:", erro);
    throw erro;
  }
}

// ============================================
// EXEMPLO 8: FLUXO COMPLETO
// ============================================

export async function fluxoCompletoIntegracaoRastroSystem() {
  console.log("=== Iniciando fluxo completo ===\n");

  try {
    // 1. Verificar integração
    console.log("1. Verificando integração...");
    const ok = await verificarIntegracao();
    if (!ok) return;

    // 2. Criar cliente
    console.log("\n2. Criando cliente...");
    const cliente = await criarClienteCompleto();

    // 3. Criar veículo
    console.log("\n3. Criando veículo...");
    const veiculo = await criarVeiculoComVinculo(cliente.id);

    // 4. Criar equipamento
    console.log("\n4. Criando equipamento com chip...");
    const { equipamento } = await criarEquipamentoComChip();

    // 5. Listar veículos
    console.log("\n5. Listando veículos...");
    await listarVeiculosComFiltros({ cliente: cliente.id });

    // 6. Atualizar status
    console.log("\n6. Atualizando status do veículo...");
    await atualizarStatusVeiculo(veiculo.id, "ativo");

    console.log("\n=== Fluxo completo finalizado com sucesso! ===");
  } catch (erro) {
    console.error("Erro no fluxo completo:", erro);
  }
}

// ============================================
// USO EM COMPONENTES REACT
// ============================================

/**
 * Exemplo de uso em um componente React (cliente)
 *
 * import { useState, useEffect } from "react";
 * import { listarVeiculosComFiltros } from "@/app/lib/rastrosystem";
 *
 * export function ListaVeiculos() {
 *   const [veiculos, setVeiculos] = useState([]);
 *   const [carregando, setCarregando] = useState(true);
 *   const [erro, setErro] = useState<string | null>(null);
 *
 *   useEffect(() => {
 *     async function carregar() {
 *       try {
 *         setCarregando(true);
 *         const dados = await fetch("/api/rastrosystem/veiculos").then(r => r.json());
 *         setVeiculos(dados.veiculos || []);
 *       } catch (e) {
 *         setErro(e instanceof Error ? e.message : "Erro ao carregar");
 *       } finally {
 *         setCarregando(false);
 *       }
 *     }
 *     carregar();
 *   }, []);
 *
 *   if (carregando) return <div>Carregando...</div>;
 *   if (erro) return <div>Erro: {erro}</div>;
 *
 *   return (
 *     <ul>
 *       {veiculos.map(v => (
 *         <li key={v.id}>{v.placa} - {v.status}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */
