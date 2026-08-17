import { NextRequest, NextResponse } from "next/server";
import { testarConexao, validarConfiguracao } from "@/app/lib/rastrosystem";

export async function GET(request: NextRequest) {
  try {
    const validacao = await validarConfiguracao();

    if (!validacao.valid) {
      return NextResponse.json(
        {
          status: "erro",
          message: "Configuração incompleta",
          errors: validacao.errors,
        },
        { status: 400 }
      );
    }

    const conexaoOk = await testarConexao();

    if (!conexaoOk) {
      return NextResponse.json(
        {
          status: "erro",
          message: "Falha ao conectar com RastroSystem",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      message: "RastroSystem integrado com sucesso",
      timestamp: new Date().toISOString(),
    });
  } catch (erro) {
    console.error("[HEALTH] Erro ao verificar saúde:", erro);
    return NextResponse.json(
      {
        status: "erro",
        message: "Erro ao verificar saúde da integração",
        error: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}
