import { NextRequest, NextResponse } from "next/server";
import * as rastroSystem from "@/app/lib/rastrosystem";

// ============================================
// GET - Listar chips
// ============================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filtros: rastroSystem.FiltrosChip = {
      numchip: searchParams.get("numchip") || undefined,
      operadora: searchParams.get("operadora") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
      ordem: searchParams.get("ordem") || undefined,
    };

    const resultado = await rastroSystem.listarChips(filtros);

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[API] Erro ao listar chips:", erro);
    return NextResponse.json(
      {
        error: "Erro ao listar chips",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Criar chip
// ============================================
export async function POST(request: NextRequest) {
  try {
    const dados = await request.json();

    // Validar dados obrigatórios
    const obrigatorios = ["numchip", "celmodulo", "operadora"];
    for (const campo of obrigatorios) {
      if (!dados[campo]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${campo}` },
          { status: 400 }
        );
      }
    }

    const resultado = await rastroSystem.criarChip(dados);

    return NextResponse.json(resultado, { status: 201 });
  } catch (erro) {
    console.error("[API] Erro ao criar chip:", erro);
    return NextResponse.json(
      {
        error: "Erro ao criar chip",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Atualizar chip
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const dados = await request.json();

    // Validar ID
    if (!dados.id) {
      return NextResponse.json({ error: "ID do chip é obrigatório" }, { status: 400 });
    }

    const { id, ...camposAtualizacao } = dados;

    const resultado = await rastroSystem.atualizarChip(id, camposAtualizacao);

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[API] Erro ao atualizar chip:", erro);
    return NextResponse.json(
      {
        error: "Erro ao atualizar chip",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Deletar chip
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do chip é obrigatório" }, { status: 400 });
    }

    await rastroSystem.deletarChip(id);

    return NextResponse.json({ message: "Chip deletado com sucesso" });
  } catch (erro) {
    console.error("[API] Erro ao deletar chip:", erro);
    return NextResponse.json(
      {
        error: "Erro ao deletar chip",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}
