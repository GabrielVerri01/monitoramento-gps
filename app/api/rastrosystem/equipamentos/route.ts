import { NextRequest, NextResponse } from "next/server";
import * as rastroSystem from "@/app/lib/rastrosystem";

// ============================================
// GET - Listar equipamentos
// ============================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filtros: rastroSystem.FiltrosEquipamento = {
      modulo: searchParams.get("modulo") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
      ordem: searchParams.get("ordem") || undefined,
    };

    const resultado = await rastroSystem.listarEquipamentos(filtros);

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[API] Erro ao listar equipamentos:", erro);
    return NextResponse.json(
      {
        error: "Erro ao listar equipamentos",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Criar equipamento
// ============================================
export async function POST(request: NextRequest) {
  try {
    const dados = await request.json();

    // Validar dados obrigatórios
    const obrigatorios = ["modulo", "id_versao", "id_chip"];
    for (const campo of obrigatorios) {
      if (!dados[campo]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${campo}` },
          { status: 400 }
        );
      }
    }

    const resultado = await rastroSystem.criarEquipamento(dados);

    return NextResponse.json(resultado, { status: 201 });
  } catch (erro) {
    console.error("[API] Erro ao criar equipamento:", erro);
    return NextResponse.json(
      {
        error: "Erro ao criar equipamento",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Atualizar equipamento
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const dados = await request.json();

    // Validar ID
    if (!dados.id) {
      return NextResponse.json({ error: "ID do equipamento é obrigatório" }, { status: 400 });
    }

    const { id, ...camposAtualizacao } = dados;

    const resultado = await rastroSystem.atualizarEquipamento(id, camposAtualizacao);

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[API] Erro ao atualizar equipamento:", erro);
    return NextResponse.json(
      {
        error: "Erro ao atualizar equipamento",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Deletar equipamento
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do equipamento é obrigatório" }, { status: 400 });
    }

    await rastroSystem.deletarEquipamento(id);

    return NextResponse.json({ message: "Equipamento deletado com sucesso" });
  } catch (erro) {
    console.error("[API] Erro ao deletar equipamento:", erro);
    return NextResponse.json(
      {
        error: "Erro ao deletar equipamento",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}
