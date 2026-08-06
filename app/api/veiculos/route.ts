import { NextResponse } from "next/server";
import { listarVeiculosComPosicao } from "@/app/lib/gps/multiportal";
import Database from "better-sqlite3";
import path from "path";

async function buscarVeiculosDoMultiportal(filtros?: Record<string, any>) {
  try {
    const veiculos = await listarVeiculosComPosicao(
      Object.keys(filtros ?? {}).length > 0 ? filtros : undefined
    );
    return veiculos;
  } catch (error) {
    // Silenciosamente ignora erros de Multiportal (pode não estar configurado)
    console.debug("Multiportal não disponível:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

function buscarVeiculosLocais() {
  try {
    const dbPath = path.join(process.cwd(), "dev.db");
    const db = new Database(dbPath);

    const veiculos = db
      .prepare(
        `SELECT v.*,
         GROUP_CONCAT(a.tipo, ',') as aparelhos_str
         FROM "Veiculo" v
         LEFT JOIN "Aparelho" a ON v.id = a.veiculoId
         GROUP BY v.id`
      )
      .all();

    db.close();

    return veiculos.map((veiculo: any) => ({
      id: veiculo.id,
      nome: veiculo.nome,
      setor: veiculo.setor,
      aparelhos: veiculo.aparelhos_str
        ? veiculo.aparelhos_str.split(",")
        : [],
      velocidade: veiculo.velocidade,
      placa: veiculo.placa,
      lat: veiculo.lat,
      lng: veiculo.lng,
    }));
  } catch (error) {
    console.error("Erro ao buscar veículos locais:", error);
    return [];
  }
}

function buscarVeiculosGEDUC() {
  try {
    const dbPath = path.join(process.cwd(), "dev.db");
    const db = new Database(dbPath);

    const veiculos = db
      .prepare(
        `SELECT * FROM "VeiculoGEDUC"
         WHERE receivedAt IS NOT NULL
         ORDER BY updatedAt DESC`
      )
      .all();

    db.close();

    return veiculos.map((veiculo: any) => ({
      id: veiculo.id,
      nome: veiculo.name,
      setor: "GEDUC",
      aparelhos: ["GPS"],
      velocidade: Math.round(veiculo.speedKmh || 0),
      placa: veiculo.vehicleId,
      lat: veiculo.latitude,
      lng: veiculo.longitude,
      curso: veiculo.course,
      ignicao: veiculo.ignition === 1,
    }));
  } catch (error) {
    console.warn("Veículos GEDUC não disponíveis:", error instanceof Error ? error.message : "");
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extrair filtros da query string
    const filtros: Record<string, any> = {};

    // Filtros suportados
    if (searchParams.has("setor")) {
      filtros.setor = searchParams.get("setor");
    }
    if (searchParams.has("status")) {
      filtros.status = searchParams.get("status");
    }
    if (searchParams.has("limite")) {
      filtros.limite = parseInt(searchParams.get("limite") || "100");
    }
    if (searchParams.has("offset")) {
      filtros.offset = parseInt(searchParams.get("offset") || "0");
    }
    if (searchParams.has("veiculoId")) {
      filtros.veiculoId = searchParams.get("veiculoId");
    }

    // Tentar buscar do Multiportal primeiro
    let veiculos = await buscarVeiculosDoMultiportal(filtros);

    // Se falhar, usar banco de dados local como fallback
    if (!veiculos || veiculos.length === 0) {
      console.log("Usando veículos do banco de dados local");
      veiculos = buscarVeiculosLocais();
    }

    // Adicionar veículos GEDUC
    const veiculosGEDUC = buscarVeiculosGEDUC();

    const todoVeiculos = [...(veiculos || []), ...veiculosGEDUC];

    console.log("GET /api/veiculos", {
      filtros: Object.keys(filtros).length > 0 ? filtros : "nenhum",
      totalResultados: todoVeiculos.length,
      locais: veiculos?.length || 0,
      geduc: veiculosGEDUC.length,
    });

    return NextResponse.json(todoVeiculos);
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    return NextResponse.json(
      {
        error: "Falha ao buscar veículos",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Exemplo de uso:
 * GET /api/veiculos                           → Todos os veículos
 * GET /api/veiculos?setor=Logistica           → Veículos do setor Logistica
 * GET /api/veiculos?status=ativo              → Veículos ativos
 * GET /api/veiculos?setor=Vendas&status=ativo → Combinação de filtros
 * GET /api/veiculos?limite=50                 → Limite de resultados
 */
