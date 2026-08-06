import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

export async function GET(request: Request) {
  try {
    const dbPath = path.join(process.cwd(), "dev.db");
    const db = new Database(dbPath);

    const veiculos = db
      .prepare(`SELECT * FROM "VeiculoGEDUC" ORDER BY updatedAt DESC`)
      .all();

    db.close();

    const resultado = veiculos.map((veiculo: any) => ({
      id: veiculo.id,
      nome: veiculo.name,
      setor: "GEDUC",
      aparelhos: ["GPS"],
      velocidade: Math.round(veiculo.speedKmh || 0),
      placa: veiculo.vehicleId,
      lat: veiculo.latitude,
      lng: veiculo.longitude,
      curso: veiculo.course,
      ignicao: veiculo.ignition === 1,
      fixTime: veiculo.fixTime,
      receivedAt: veiculo.receivedAt,
      updatedAt: veiculo.updatedAt,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao listar veículos GEDUC:", error);
    return NextResponse.json(
      {
        error: "Falha ao listar veículos GEDUC",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
