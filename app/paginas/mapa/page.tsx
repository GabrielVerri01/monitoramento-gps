"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import MapComponent,{ Veiculo } from "@/app/paginas/mapa/_components/MapComponent";
import { useTheme } from "next-themes";
import { FaSignOutAlt } from "react-icons/fa";
import { HiInformationCircle } from "react-icons/hi2";

const MapComponentContainer = dynamic(
  () => import("@/app/paginas/mapa/_components/MapComponent"),
  { ssr: false }
);

export default function MonitoramentoPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [infoAberta, setInfoAberta] = useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);

  async function carregarDados() {
    try {
      const agora = new Date().toLocaleTimeString('pt-BR');
      console.log(`[${agora}] 🔄 Atualizando posições dos veículos...`);

      // Sincronizar dados GEDUC primeiro
      await fetch("/api/geduc/posicoes").catch(() => {
        // Ignorar erros de GEDUC se não estiver configurado
      });

      // Buscar veículos GEDUC
      const respostaVeiculos = await fetch("/api/veiculos");
      const listaVeiculos = await respostaVeiculos.json();

      if (!respostaVeiculos.ok) {
        console.error("Erro ao buscar veículos GEDUC:", respostaVeiculos.status, listaVeiculos);
        return;
      }

      // Buscar aparelhos
      const respostaAparelhos = await fetch("/api/aparelhos");
      const listaAparelhos = await respostaAparelhos.json();

      // Processar veículos GEDUC
      const veiculosGEDUC = listaVeiculos.map((veiculo: any) => {
        if (veiculo.aparelhos && veiculo.aparelhos.length > 0) {
          return veiculo;
        }

        const aparelhosVeiculo = listaAparelhos
          .filter((a: any) => a.veiculoId === veiculo.id)
          .map((a: any) => a.tipo);

        return {
          ...veiculo,
          aparelhos: aparelhosVeiculo.length > 0 ? aparelhosVeiculo : ["GPS"],
        };
      });

      // Buscar veículos SEMIT (RastroSystem)
      let veiculosSEMIT = [];
      try {
        const respostaSEMIT = await fetch("/api/mapa/veiculos-semit");
        if (respostaSEMIT.ok) {
          const dataSEMIT = await respostaSEMIT.json();
          veiculosSEMIT = dataSEMIT.veiculos || [];
          console.log(`[${agora}] ✅ ${veiculosSEMIT.length} veículos SEMIT carregados`);
        }
      } catch (erro) {
        console.error("Erro ao carregar SEMIT:", erro);
        // Continua sem SEMIT se não conseguir
      }

      // Combinar veículos de ambas as fontes
      const resultado = [...veiculosGEDUC, ...veiculosSEMIT];

      setVeiculos(resultado);
      console.log(`[${agora}] ✅ ${resultado.length} veículos carregados (próxima atualização em 60 segundos)`);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  useEffect(() => {
    carregarDados();

    // intervalo de 30 a 60(recomendado) segundos para atualizacao
    const interval = setInterval(carregarDados, 20000); //mudei para 20 segundos 

    return () => clearInterval(interval);
  }, []);


  const [setoresAtivos, setSetoresAtivos] = useState<string[]>(["SEMUSC", "SEMED", "SMTT", "BLITZ", "SEMAPA", "SAMU", "GEDUC", "SEMIT"]);
  const [aparelhosAtivos, setAparelhosAtivos] = useState<string[]>(["GPS", "RÁDIO"]);

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

  function handleLogout(){
    console.log(`usuario: ${localStorage.getItem("usuario")}`);
    localStorage.removeItem("usuario");
    window.location.href = "/";
  }
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">

      <aside
        className="absolute left-0 top-0 z-[1001] h-full w-[min(300px,88vw)] overflow-y-auto bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white p-6 shadow-2xl"
      >
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Filtros</h1>
            <button onClick={function() { handleLogout(); }} type="button" className="rounded-md bg-red-200 px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-red-300"> 
              <FaSignOutAlt className="inline-block mr-2" />
              Sair
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
                  className="h-4 w-4 accent-zinc-900 "
                  checked={setoresAtivos.includes("SEMUSC")}
                  onChange={() => handleCheckboxChange("SEMUSC")}
                />
                <span className="text-sm font-medium">SEMUSC</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900"
                  checked={setoresAtivos.includes("SEMED")}
                  onChange={() => handleCheckboxChange("SEMED")}
                />
                <span className="text-sm font-medium">SEMED</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900"
                  checked={setoresAtivos.includes("SMTT")}
                  onChange={() => handleCheckboxChange("SMTT")}
                />
                <span className="text-sm font-medium">SMTT</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900"
                  checked={setoresAtivos.includes("BLITZ")}
                  onChange={() => handleCheckboxChange("BLITZ")}
                />
                <span className="text-sm font-medium">BLITZ</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900"
                  checked={setoresAtivos.includes("SEMAPA")}
                  onChange={() => handleCheckboxChange("SEMAPA")}
                />
                <span className="text-sm font-medium">SEMAPA</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900"
                  checked={setoresAtivos.includes("SAMU")}
                  onChange={() => handleCheckboxChange("SAMU")}
                />
                <span className="text-sm font-medium">SAMU</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900"
                  checked={setoresAtivos.includes("GEDUC")}
                  onChange={() => handleCheckboxChange("GEDUC")}
                />
                <span className="text-sm font-medium">GEDUC (Transporte Escolar)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zinc-900"
                  checked={setoresAtivos.includes("SEMIT")}
                  onChange={() => handleCheckboxChange("SEMIT")}
                />
                <span className="text-sm font-medium">SEMIT (Integração RastroSystem)</span>
              </label>
            </div>
          </section>
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
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

        <button
        type="button"
        className="absolute right-6 top-6 z-[1001] p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-2xl bg-white dark:bg-zinc-900"
        onClick={() => setInfoAberta(!infoAberta)}>
          <HiInformationCircle className="h-6 w-6 text-zinc-900 dark:text-white" />
        </button>

        <aside
          className={`absolute right-0 top-0 z-[1002] h-[45vh] w-[min(230px,88vw)] overflow-y-auto bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white p-6 shadow-2xl transition-all duration-300 ease-in-out rounded-lg ${
            infoAberta ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {veiculoSelecionado ? "Informações do Veículo" : "Informações"}
              </h1>
              <button
                onClick={() => {
                  setInfoAberta(false);
                  setVeiculoSelecionado(null);
                }}
                type="button"
                className="text-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
              <section className="space-y-3">
                {veiculoSelecionado ? (
                  <>
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                      <p className="text-sm font-bold text-lg mb-3">{veiculoSelecionado.nome}</p>
                      <p className="text-sm"><strong>ID:</strong> {veiculoSelecionado.id}</p>
                      <p className="text-sm"><strong>Setor:</strong> {veiculoSelecionado.setor}</p>
                      <p className="text-sm"><strong>Placa:</strong> {veiculoSelecionado.placa || "N/A"}</p>
                      <p className="text-sm"><strong>Velocidade:</strong> {veiculoSelecionado.velocidade || 0} km/h</p>
                      <p className="text-sm"><strong>Aparelhos:</strong> {(veiculoSelecionado.aparelhos || ["GPS"]).join(", ")}</p>
                      <p className="text-sm"><strong>Latitude:</strong> {veiculoSelecionado.lat.toFixed(4)}</p>
                      <p className="text-sm"><strong>Longitude:</strong> {veiculoSelecionado.lng.toFixed(4)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setVeiculoSelecionado(null);
                      }}
                      type="button"
                      className="w-full mt-4 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white px-4 py-2 rounded-md transition"
                    >
                      Limpar Seleção
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm">Aqui você verá as informações para contato ou alerta do veículo selecionado.</p>
                    <p className="text-sm">Caso o veículo esteja dentro da área (raio de 1km), você receberá as informações.</p>
                  </>
                )}
              </section>
            </div>
          </aside>

      <div
        className="h-full w-full"
      >
        <MapComponent
          veiculos={veiculos}
          setoresAtivos={setoresAtivos}
          aparelhosAtivos={aparelhosAtivos}
          onVeiculoSelecionado={(veiculo) => {
            setVeiculoSelecionado(veiculo);
            setInfoAberta(true);
          }}
        />
      </div>
    </div>
  );
}
