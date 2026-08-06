import { NextResponse } from "next/server";

export async function GET() {
  const GEDUC_API_KEY = process.env.GEDUC_API_KEY;
  const GEDUC_TENANT_ID = process.env.GEDUC_TENANT_ID;

  return NextResponse.json({
    configurado: !!(GEDUC_API_KEY && GEDUC_TENANT_ID),
    tenantId: GEDUC_TENANT_ID || "NÃO CONFIGURADO",
    apiKey: GEDUC_API_KEY
      ? `${GEDUC_API_KEY.substring(0, 10)}...***`
      : "NÃO CONFIGURADO",
    mensagem:
      "Configure GEDUC_API_KEY e GEDUC_TENANT_ID no arquivo .env.local",
    exemplo: {
      GEDUC_API_KEY: "seu_token_aqui",
      GEDUC_TENANT_ID: "2111300",
    },
  });
}
