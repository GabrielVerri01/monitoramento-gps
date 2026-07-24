import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "1",
      nome: "Carro 1",
      placa: "ABC-1234",
      setor: "Logistica",
      lat: -23.5505,
      lng: -46.6333,
      velocidade: 62,
      ligado: true,
      ultimaAtualizacao: new Date(),
    },
    {
      id: "2",
      nome: "Carro 2",
      placa: "DEF-5678",
      setor: "Logistica",
      lat: -23.558,
      lng: -46.641,
      velocidade: 45,
      ligado: false,
      ultimaAtualizacao: new Date(),
    },
    {
      id: "3",
      nome: "Carro 3",
      placa: "GHI-9012",
      setor: "Vendas",
      lat: -23.542,
      lng: -46.622,
      velocidade: 38,
      ligado: true,
      ultimaAtualizacao: new Date(),
    },
  ]);
}