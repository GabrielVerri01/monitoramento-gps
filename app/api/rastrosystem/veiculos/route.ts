import { NextRequest, NextResponse } from "next/server";
import * as rastroSystem from "@/app/lib/rastrosystem";

// ============================================
// GET - Listar veículos
// ============================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filtros: rastroSystem.FiltrosVeiculoV02 = {
      id: searchParams.get("id") || undefined,
      placa: searchParams.get("placa") || undefined,
      cliente: searchParams.get("cliente") || undefined,
      cnpjCliente: searchParams.get("cnpjCliente") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
      ordem: searchParams.get("ordem") || undefined,
    };

    const resultado = await rastroSystem.listarVeiculosV02(filtros);

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[API] Erro ao listar veículos:", erro);
    return NextResponse.json(
      {
        error: "Erro ao listar veículos",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Criar veículo
// ============================================
export async function POST(request: NextRequest) {
  try {
    const dados = await request.json();

    // Validar dados obrigatórios
    const obrigatorios = ["placa", "status", "pessoa_id"];
    for (const campo of obrigatorios) {
      if (!dados[campo]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${campo}` },
          { status: 400 }
        );
      }
    }

    // Validar enum status
    if (!["ativo", "inativo", "inadimplente"].includes(dados.status)) {
      return NextResponse.json(
        { error: "Status deve ser: ativo, inativo ou inadimplente" },
        { status: 400 }
      );
    }

    const resultado = await rastroSystem.criarVeiculoV02(dados);

    return NextResponse.json(resultado, { status: 201 });
  } catch (erro) {
    console.error("[API] Erro ao criar veículo:", erro);
    return NextResponse.json(
      {
        error: "Erro ao criar veículo",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Atualizar veículo
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const dados = await request.json();

    // Validar ID
    if (!dados.id) {
      return NextResponse.json({ error: "ID do veículo é obrigatório" }, { status: 400 });
    }

    const { id, ...camposAtualizacao } = dados;

    const resultado = await rastroSystem.atualizarVeiculoV02(id, camposAtualizacao);

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[API] Erro ao atualizar veículo:", erro);
    return NextResponse.json(
      {
        error: "Erro ao atualizar veículo",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Deletar veículo
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do veículo é obrigatório" }, { status: 400 });
    }

    await rastroSystem.deletarVeiculoV02(id);

    return NextResponse.json({ message: "Veículo deletado com sucesso" });
  } catch (erro) {
    console.error("[API] Erro ao deletar veículo:", erro);
    return NextResponse.json(
      {
        error: "Erro ao deletar veículo",
        message: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}
