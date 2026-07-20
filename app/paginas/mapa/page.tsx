"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Veiculo } from "@/components/MapComponent";

const MapComponentContainer = dynamic(
  () => import("@/components/MapComponent"),
  { ssr: false }
);

export default function MonitoramentoPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([
    { id: "1", nome: "Carro 1", setor: "Logistica", lat: -23.5505, lng: -46.6333 },
    { id: "2", nome: "Carro 2", setor: "Logistica", lat: -23.558, lng: -46.641 },
    { id: "3", nome: "Carro 3", setor: "Vendas", lat: -23.542, lng: -46.622 },
  ]);
  const [setoresAtivos, setSetoresAtivos] = useState<string[]>(["Logistica", "Vendas"]);
  const [sidebarAberto, setSidebarAberto] = useState(false);

  useEffect(() => {
    const movimentosPorCarro: Record<string, { lat: number; lng: number }> = {
      "1": { lat: 0.0003, lng: 0.0003 },
      "2": { lat: -0.0002, lng: 0.00025 },
      "3": { lat: 0.00025, lng: -0.0002 },
    };

    const interval = setInterval(() => {
      setVeiculos((listaAntiga) =>
        listaAntiga.map((carro) => {
          const movimento = movimentosPorCarro[carro.id] ?? { lat: 0.0002, lng: 0.0002 };

          return {
            ...carro,
            lat: carro.lat + movimento.lat,
            lng: carro.lng + movimento.lng,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckboxChange = (setor: string) => {
    setSetoresAtivos((antigos) =>
      antigos.includes(setor)
        ? antigos.filter((s) => s !== setor) //remove o filtro se estiver ativo
        : [...antigos, setor]  //adiciona se nao estiver ativo
    );
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
      <button
        type="button"
        aria-label="Abrir filtros"
        onClick={() => setSidebarAberto(true)}
        className="absolute left-5 top-5 z-[1000] flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-xl font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
      >
        X
      </button>

      <aside
        className={`absolute left-0 top-0 z-[1001] h-full w-[min(340px,88vw)] bg-white p-6 text-zinc-900 shadow-2xl transition-transform duration-300 ease-out ${
          sidebarAberto ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!sidebarAberto}
      >
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Filtros</h1>
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setSidebarAberto(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-lg font-semibold transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            X
          </button>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Setores
          </h2>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
              <input
                type="checkbox"
                className="h-4 w-4 accent-zinc-900"
                checked={setoresAtivos.includes("Logistica")}
                onChange={() => handleCheckboxChange("Logistica")}
              />
              <span className="text-sm font-medium">Logistica</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
              <input
                type="checkbox"
                className="h-4 w-4 accent-zinc-900"
                checked={setoresAtivos.includes("Vendas")}
                onChange={() => handleCheckboxChange("Vendas")}
              />
              <span className="text-sm font-medium">Vendas</span>
            </label>
          </div>
        </section>
      </aside>

      {sidebarAberto && (
        <button
          type="button"
          aria-label="Fechar filtros"
          onClick={() => setSidebarAberto(false)}
          className="absolute inset-0 z-[999] bg-black/20 backdrop-blur-sm"
        />
      )}

      <div
        className={`h-full w-full transition duration-300 ${
          sidebarAberto ? "scale-[1.01] blur-sm" : "scale-100 blur-0"
        }`}
      >
        <MapComponentContainer veiculos={veiculos} setoresAtivos={setoresAtivos} />
      </div>
    </div>
  );
}
