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
  ]);
}