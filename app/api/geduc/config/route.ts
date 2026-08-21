import { NextResponse } from "next/server";

export async function GET() {
  const GEDUC_API_KEY = process.env.GEDUC_API_KEY;
  const GEDUC_TENANT_ID = process.env.GEDUC_TENANT_ID;

  return NextResponse.json({
    configurado: !!(GEDUC_API_KEY && GEDUC_TENANT_ID),
    mensagem: "Configuração GEDUC disponível no servidor",
  });
}
