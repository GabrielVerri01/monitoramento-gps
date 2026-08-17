import { NextResponse } from "next/server";
import { listarVeiculosV02 } from "@/app/lib/rastrosystem";
import { Veiculo } from "@/app/paginas/mapa/_components/MapComponent";

// Simular coordenadas por placa (pseudoaleatório, mas consistente)
function gerarCoordenadasPorPlaca(placa: string): { lat: number; lng: number } {
  const hash = placa.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseLatMin = -2.55;
  const baseLatMax = -2.45;
  const baseLngMin = -44.35;
  const baseLngMax = -44.15;

  const lat = baseLatMin + (hash % 100) / 100 * (baseLatMax - baseLatMin);
  const lng = baseLngMin + ((hash * 7) % 100) / 100 * (baseLngMax - baseLngMin);

  return { lat, lng };
}

export async function GET() {
  try {
    // Buscar veículos da RastroSystem
    const resposta = await listarVeiculosV02({ limit: 100 });

    if (!resposta.veiculos || resposta.veiculos.length === 0) {
      return NextResponse.json({ veiculos: [] });
    }

    // Transformar para formato do MapComponent
    const veiculos: Veiculo[] = resposta.veiculos.map((v) => {
      const coordenadas = gerarCoordenadasPorPlaca(v.placa);

      return {
        id: String(v.id),
        nome: `${v.marca} ${v.modelo} (${v.placa})`,
        setor: "SEMIT",
        placa: v.placa,
        aparelhos: ["GPS"],
        velocidade: 0,
        lat: coordenadas.lat,
        lng: coordenadas.lng,
      };
    });

    console.log(`[MAPA] ${veiculos.length} veículos SEMIT carregados`);

    return NextResponse.json({ veiculos });
  } catch (erro) {
    console.error("[MAPA] Erro ao buscar veículos SEMIT:", erro);
    return NextResponse.json(
      { error: "Erro ao buscar veículos SEMIT", veiculos: [] },
      { status: 500 }
    );
  }
}
