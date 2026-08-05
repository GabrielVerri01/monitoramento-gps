import { NextResponse } from "next/server";
import { listarVeiculosComPosicao } from "@/app/lib/gps/multiportal";

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

    // Buscar veículos com filtros
    const veiculos = await listarVeiculosComPosicao(
      Object.keys(filtros).length > 0 ? filtros : undefined
    );

    // Log para debug
    console.log("GET /api/veiculos", {
      filtros: Object.keys(filtros).length > 0 ? filtros : "nenhum",
      totalResultados: veiculos.length,
    });

    return NextResponse.json(veiculos);
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
