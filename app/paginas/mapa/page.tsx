"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import MapComponent, { Veiculo } from "@/components/MapComponent";
import { useTheme } from "next-themes";

const MapComponentContainer = dynamic(
  () => import("@/components/MapComponent"),
  { ssr: false }
);

export default function MonitoramentoPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  useEffect(() => {
    async function carregarDados() {
      const respostaVeiculos = await fetch("/api/veiculos");
      const listaVeiculos = await respostaVeiculos.json();

      const respostaAparelhos = await fetch("/api/aparelhos");
      const listaAparelhos = await respostaAparelhos.json();

      const resultado = listaVeiculos.map((veiculo: any) => ({
        ...veiculo,
        aparelhos: listaAparelhos
          .filter((a: any) => a.veiculoId === veiculo.id)
          .map((a: any) => a.tipo),
      }));

      setVeiculos(resultado);
    }

    carregarDados();
}, []);
    // { id: "1", nome: "Carro 1", setor: "Logistica", aparelhos: ["GPS", "RÁDIO"], lat: -23.5505, lng: -46.6333 },
    // { id: "2", nome: "Carro 2", setor: "Logistica", aparelhos: ["GPS"], lat: -23.558, lng: -46.641 },
    // { id: "3", nome: "Carro 3", setor: "Vendas", aparelhos: ["RÁDIO"], lat: -23.542, lng: -46.622 },



  const [setoresAtivos, setSetoresAtivos] = useState<string[]>(["Logistica", "Vendas"]);
  const [aparelhosAtivos, setAparelhosAtivos] = useState<string[]>(["GPS", "RÁDIO"]);
  // const [sidebarAberto, setSidebarAberto] = useState(false);   sidebar abria e fechava 

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

  //tipo de aparelho
  const handleAparelhoCheckboxChange = (aparelho: string) => {
    setAparelhosAtivos((antigos) =>
      antigos.includes(aparelho)
        ? antigos.filter((a) => a !== aparelho) //remove o filtro se estiver ativo
        : [...antigos, aparelho]  //adiciona se nao estiver ativo
    );
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">

      <aside
        className="absolute left-0 top-0 z-[1001] h-full w-[min(340px,88vw)] overflow-y-auto bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white p-6 shadow-2xl"
      >
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Filtros</h1>
            <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} type="button" className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-300">
              Mudar tema 
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
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900 "
                  checked={setoresAtivos.includes("SEMUSC")}
                  onChange={() => handleCheckboxChange("SEMUSC")}
                />
                <span className="text-sm font-medium bg-zinc-50 dark:bg-zinc-800 p-2 rounded-md">SEMUSC</span>
              </label>
            </div>
          </section>
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 bg-zinc-50 dark:bg-zinc-800 p-2 rounded-md">
              APARELHOS
            </h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900"
                  checked={aparelhosAtivos.includes("RÁDIO")}
                  onChange={() => handleAparelhoCheckboxChange("RÁDIO")}
                />
                <span className="text-sm font-medium">RÁDIO</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900"
                  checked={aparelhosAtivos.includes("GPS")}
                  onChange={() => handleAparelhoCheckboxChange("GPS")}
                />
                <span className="text-sm font-medium">GPS</span>
              </label>
              
            </div>
            
          </section>
        </div>

      </aside>

      <div
        className="h-full w-full"
      >
        <MapComponent veiculos={veiculos} setoresAtivos={setoresAtivos} aparelhosAtivos={aparelhosAtivos} />
      </div>
    </div>
  );
}
