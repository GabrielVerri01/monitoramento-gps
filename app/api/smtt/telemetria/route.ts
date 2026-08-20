import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const SMTT_API_URL = process.env.SMTT_API_URL || "";
const TENANT_ID = process.env.SMTT_TENANT_ID || "";
const API_KEY = process.env.SMTT_API_KEY || "";

interface SMTTVehicle {
  id: string;
  clientePrincipal: string;
  cliente: string;
  frota: string;
  placa: string;
  marca: string;
  modelo: string;
  srn: string;
  cor: string;
  ano: string;
  data: string;
  ignicao: string;
  tensao: number;
  velocidade: number;
  odometro: number;
  latitude: number;
  longitude: number;
  condutor?: string;
}

interface SMTTResponse {
  data: {
    serverTime: string;
    positions: SMTTVehicle[];
  };
  isArray: boolean;
  arrayLength: number;
  path: string;
  duration: string;
  method: string;
}

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "SMTT_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Busca o cursor anterior do banco
    let cursor = await prisma.sMTTCursor.findUnique({
      where: { id: "smtt_default" },
    });

    // Cria um novo cursor se não existir
    if (!cursor) {
      cursor = await prisma.sMTTCursor.create({
        data: { id: "smtt_default" },
      });
    }

    // Monta a URL da requisição
    const url = new URL(SMTT_API_URL);
    if (cursor.updatedSince) {
      url.searchParams.set("updatedSince", cursor.updatedSince);
    }
    // Adiciona o token como query parameter
    url.searchParams.set("partialToken", API_KEY);

    // Faz a chamada para a API da SMTT
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "tenant-id": TENANT_ID,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`SMTT API Error (${response.status}):`, errorData);
      return NextResponse.json(
        { error: `SMTT API returned ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data: any = await response.json();

    // A API retorna um array direto, não um objeto com data.positions
    const positions = Array.isArray(data) ? data : (data.data?.positions || []);

    // Log dos campos para debug
    if (positions.length > 0) {
      console.log("=== CAMPOS DA API SMTT ===");
      console.log("Todos os campos do primeiro veículo:", Object.keys(positions[0]));
      console.log("Primeiro veículo completo:", positions[0]);
    }

    // Atualiza o cursor com a data/hora mais recente
    if (positions.length > 0) {
      const latestDate = new Date().toISOString();
      await prisma.sMTTCursor.update({
        where: { id: "smtt_default" },
        data: { updatedSince: latestDate },
      });
    }

    // Formata os dados para compatibilidade com a interface Veiculo
    const veiculos = positions.map((pos: SMTTVehicle) => {
      // Identifica se é moto ou carro baseado na frota (MT = moto)
      const tipo = pos.frota?.toUpperCase().startsWith("MT") ? "MOTO" : "CARRO";

      return {
        id: pos.id,
        frota: pos.frota,
        nome: `${pos.frota} - ${pos.placa}`,
        setor: "SMTT",
        placa: pos.placa,
        lat: pos.latitude,
        lng: pos.longitude,
        velocidade: Math.round(pos.velocidade),
        curso: 0, // API não fornece direção
        ignicao: pos.ignicao === "LIGADA",
        fixTime: new Date(pos.data).toISOString(),
        receivedAt: new Date(pos.data).toISOString(),
        aparelhos: ["GPS"],
        modelo: pos.modelo,
        marca: pos.marca,
        ano: pos.ano,
        tipo, // MOTO ou CARRO
      };
    });

    return NextResponse.json(
      {
        veiculos,
        count: veiculos.length,
        cursor: cursor.updatedSince,
        serverTime: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching SMTT telemetry:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
