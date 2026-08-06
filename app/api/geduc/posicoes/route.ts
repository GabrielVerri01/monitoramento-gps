import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const GEDUC_API_URL = "https://thanos.geduc.com.br/transport/positions";
const GEDUC_API_KEY = process.env.GEDUC_API_KEY;
const GEDUC_TENANT_ID = process.env.GEDUC_TENANT_ID;

function saveCursor(positions: any[]) {
  if (!positions || positions.length === 0) return;

  try {
    const dbPath = path.join(process.cwd(), "dev.db");
    const db = new Database(dbPath);

    // Criar tabela se não existir
    db.exec(`
      CREATE TABLE IF NOT EXISTS "VeiculoGEDUC" (
        "id" text PRIMARY KEY,
        "vehicleId" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "latitude" real NOT NULL,
        "longitude" real NOT NULL,
        "speedKmh" real,
        "course" integer,
        "ignition" boolean,
        "fixTime" text,
        "receivedAt" text,
        "updatedAt" datetime DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const insert = db.prepare(`
      INSERT INTO "VeiculoGEDUC"
      (id, vehicleId, name, latitude, longitude, speedKmh, course, ignition, fixTime, receivedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(vehicleId) DO UPDATE SET
        name = excluded.name,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        speedKmh = excluded.speedKmh,
        course = excluded.course,
        ignition = excluded.ignition,
        fixTime = excluded.fixTime,
        receivedAt = excluded.receivedAt,
        updatedAt = CURRENT_TIMESTAMP
    `);

    positions.forEach((pos) => {
      insert.run(
        pos.vehicleId,
        pos.vehicleId,
        pos.name,
        pos.latitude,
        pos.longitude,
        pos.speedKmh,
        pos.course,
        pos.ignition ? 1 : 0,
        pos.fixTime,
        pos.receivedAt
      );
    });

    db.close();
  } catch (error) {
    console.error("Erro ao salvar posições:", error);
  }
}

export async function GET(request: Request) {
  try {
    if (!GEDUC_API_KEY || !GEDUC_TENANT_ID) {
      return NextResponse.json(
        {
          error: "Credenciais GEDUC não configuradas",
          detalhe: "Defina GEDUC_API_KEY e GEDUC_TENANT_ID em .env.local",
        },
        { status: 500 }
      );
    }

    const url = new URL(GEDUC_API_URL);
    // Sempre sincroniza tudo sem usar cursor
    // Isso garante que sempre recebemos as posições mais recentes

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `API-KEY ${GEDUC_API_KEY}`,
        "tenant-id": GEDUC_TENANT_ID,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Erro GEDUC:", response.status, error);
      return NextResponse.json(
        {
          error: `Erro ao buscar posições GEDUC: ${response.status}`,
          detalhe: error,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const positions = data.data?.positions || [];

    // Salvar posições no banco
    if (positions.length > 0) {
      saveCursor(positions);
    }

    return NextResponse.json({
      serverTime: data.data?.serverTime,
      positions: positions.map((pos: any) => ({
        id: pos.vehicleId,
        nome: pos.name,
        setor: "GEDUC",
        aparelhos: ["GPS"],
        velocidade: Math.round(pos.speedKmh),
        placa: pos.vehicleId,
        lat: pos.latitude,
        lng: pos.longitude,
        curso: pos.course,
        ignicao: pos.ignition,
        fixTime: pos.fixTime,
        receivedAt: pos.receivedAt,
      })),
      totalResultados: positions.length,
    });
  } catch (error) {
    console.error("Erro ao buscar posições GEDUC:", error);
    return NextResponse.json(
      {
        error: "Falha ao buscar posições GEDUC",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
