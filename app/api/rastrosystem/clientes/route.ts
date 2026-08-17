import { NextRequest, NextResponse } from "next/server";
import * as rastroSystem from "@/app/lib/rastrosystem";

// ============================================
// GET - Listar clientes
// ============================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filtros: rastroSystem.FiltrosCliente = {
      id: searchParams.get("id") || undefined,
      cnpj: searchParams.get("cnpj") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
      ordem: searchParams.get("ordem") || undefined,
    };

    const resultado = await rastroSystem.listarClientes(filtros);

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[API] Erro ao listar clientes:", erro);
    return NextResponse.json(
      {
        error: "Erro ao listar clientes",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Criar cliente
// ============================================
export async function POST(request: NextRequest) {
  try {
    const dados = await request.json();

    // Validar dados obrigatórios
    const obrigatorios = ["id", "nome", "sistema", "ativo", "cnpj", "email", "endereco"];
    for (const campo of obrigatorios) {
      if (!dados[campo]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${campo}` },
          { status: 400 }
        );
      }
    }

    const resultado = await rastroSystem.criarCliente(dados);

    return NextResponse.json(resultado, { status: 201 });
  } catch (erro) {
    console.error("[API] Erro ao criar cliente:", erro);
    return NextResponse.json(
      {
        error: "Erro ao criar cliente",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Atualizar cliente
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const dados = await request.json();

    // Validar ID
    if (!dados.id) {
      return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 });
    }

    const resultado = await rastroSystem.atualizarCliente(dados);

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[API] Erro ao atualizar cliente:", erro);
    return NextResponse.json(
      {
        error: "Erro ao atualizar cliente",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Deletar cliente
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 });
    }

    await rastroSystem.deletarCliente(id);

    return NextResponse.json({ message: "Cliente deletado com sucesso" });
  } catch (erro) {
    console.error("[API] Erro ao deletar cliente:", erro);
    return NextResponse.json(
      {
        error: "Erro ao deletar cliente",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}
