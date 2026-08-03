import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      veiculoId: "1",
      tipo: "GPS",
    },
    {
      veiculoId: "1",
      tipo: "RÁDIO",
    },
    {
      veiculoId: "2",
      tipo: "GPS",
    },
    {
      veiculoId: "3",
      tipo: "RÁDIO",
    },
    {
      veiculoId: "4",
      tipo: "GPS",
    },
    {
      veiculoId: "5",
      tipo: "RÁDIO",
    },
    {
      veiculoId: "6",
      tipo: "GPS",
    },
    {
      veiculoId: "7",
      tipo: "RÁDIO",
    },
    {
      veiculoId: "7",
      tipo: "GPS",
    },
    {
      veiculoId: "8",
      tipo: "RÁDIO",
    },
    {
      veiculoId: "9",
      tipo: "GPS",
    }
  ]);
}