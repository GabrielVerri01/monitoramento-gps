import { NextResponse } from "next/server";
import { listarVeiculosComPosicao } from "@/app/lib/gps/multiportal";

export async function GET() {
  try {
    const veiculos = await listarVeiculosComPosicao();
    console.log("RESPOSTA MULTIPORTAL:", JSON.stringify(veiculos, null, 2));
    return NextResponse.json(veiculos);
  } catch (error) {
    console.error("Erro ao buscar veículos com posição:", error);
    return NextResponse.json(
      {
        error: "Falha ao buscar veículos",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   return NextResponse.json([
//     {
//       id: "1",
//       nome: "Carro 1",
//       placa: "ABC-1234",
//       setor: "Logistica",
//       lat: -23.5505,
//       lng: -46.6333,
//       velocidade: 62,
//       ligado: true,
//       ultimaAtualizacao: new Date(),
//     },
//     {
//       id: "2",
//       nome: "Carro 2",
//       placa: "DEF-5678",
//       setor: "Logistica",
//       lat: -23.558,
//       lng: -46.641,
//       velocidade: 45,
//       ligado: false,
//       ultimaAtualizacao: new Date(),
//     },
//     {
//       id: "3",
//       nome: "Carro 3",
//       placa: "GHI-9012",
//       setor: "Vendas",
//       lat: -23.542,
//       lng: -46.622,
//       velocidade: 38,
//       ligado: true,
//       ultimaAtualizacao: new Date(),
//     },
//     {
//       id: "4",
//       nome: "Carro 4",
//       placa: "JKL-3456",
//       setor: "SEMUSC",
//       lat: -23.545,
//       lng: -46.630,
//       velocidade: 50,
//       ligado: true,
//       ultimaAtualizacao: new Date(),
//     },
//     {
//       id: "5",
//       nome: "Carro 5",
//       placa: "MNO-7890",
//       setor: "SEMED",
//       lat: -23.550,
//       lng: -46.635,
//       velocidade: 55,
//       ligado: true,
//       ultimaAtualizacao: new Date(),
//     },
//     {
//       id: "6",
//       nome: "Carro 6",
//       placa: "PQR-1234",
//       setor: "SMTT",
//       lat: -23.552,
//       lng: -46.637,
//       velocidade: 60,
//       ligado: true,
//       ultimaAtualizacao: new Date(),
//     },
//     {
//       id: "7",
//       nome: "Carro 7",
//       placa: "STU-5678",
//       setor: "BLITZ",
//       lat: -23.555,
//       lng: -46.640,
//       velocidade: 48,
//       ligado: false,
//       ultimaAtualizacao: new Date(),
//     },
//     {
//       id: "8",
//       nome: "Carro 8",
//       placa: "VWX-9012",
//       setor: "SEMAPA",
//       lat: -23.558,
//       lng: -46.642,
//       velocidade: 52,
//       ligado: true,
//       ultimaAtualizacao: new Date(),
//     },
//     {
//       id: "9",
//       nome: "Carro 9",
//       placa: "YZA-3456",
//       setor: "SAMU",
//       lat: -23.560,
//       lng: -46.645,
//       velocidade: 47,
//       ligado: true,
//       ultimaAtualizacao: new Date(),
//     }
//   ]);
// }