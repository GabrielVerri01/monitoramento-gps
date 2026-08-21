"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import MapComponent,{ Veiculo } from "@/app/paginas/mapa/_components/MapComponent";
import { useTheme } from "next-themes";
import { FaSignOutAlt } from "react-icons/fa";
import { HiInformationCircle, HiMagnifyingGlass } from "react-icons/hi2";

const MapComponentContainer = dynamic(
  () => import("@/app/paginas/mapa/_components/MapComponent"),
  { ssr: false }
);

export default function MonitoramentoPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [infoAberta, setInfoAberta] = useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);
  const [pesquisaAberta, setPesquisaAberta] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [resultadosPesquisa, setResultadosPesquisa] = useState<Veiculo[]>([]);
  const mapRef = useRef<any>(null);

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

      // Buscar veículos SMTT (Autovision)
      let veiculosSMTT = [];
      try {
        const respostaSMTT = await fetch("/api/smtt/telemetria");
        if (respostaSMTT.ok) {
          const dataSMTT = await respostaSMTT.json();
          veiculosSMTT = dataSMTT.veiculos || [];
          console.log(`[${agora}] ✅ ${veiculosSMTT.length} veículos SMTT carregados`);
        }
      } catch (erro) {
        console.error("Erro ao carregar SMTT:", erro);
        // Continua sem SMTT se não conseguir
      }

      // Combinar veículos de todas as fontes
      const resultado = [...veiculosGEDUC, ...veiculosSEMIT, ...veiculosSMTT];

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
  const [tiposAtivos, setTiposAtivos] = useState<string[]>(["CARRO", "MOTO"]);
  const [expandidoCarros, setExpandidoCarros] = useState(false);
  const [expandidoMotos, setExpandidoMotos] = useState(false);
  const [veiculosDesabilitados, setVeiculosDesabilitados] = useState<string[]>([]);

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

  //tipo de veiculo
  const handleTipoCheckboxChange = (tipo: string) => {
    setTiposAtivos((antigos) =>
      antigos.includes(tipo)
        ? antigos.filter((t) => t !== tipo) //remove o filtro se estiver ativo
        : [...antigos, tipo]  //adiciona se nao estiver ativo
    );
  };

  const handleVeiculoToggle = (veiculoId: string) => {
    setVeiculosDesabilitados((antigos) =>
      antigos.includes(veiculoId)
        ? antigos.filter(id => id !== veiculoId)
        : [...antigos, veiculoId]
    );
  };

  //pesquisa de carro por placa/codigo
  const buscarVeiculo = (termo: string) => {
    setTermoPesquisa(termo);
    if (termo.trim() === "") {
      setResultadosPesquisa([]);
      return;
    }

    const termoLower = termo.toLowerCase();
    const resultados = veiculos.filter((v) =>
      (v.placa && v.placa.toLowerCase().includes(termoLower)) ||
      v.id.toLowerCase().includes(termoLower) ||
      v.nome.toLowerCase().includes(termoLower)
    );
    setResultadosPesquisa(resultados);
  };

  const selecionarVeiculoDaBusca = (veiculo: Veiculo) => {
    setVeiculoSelecionado(veiculo);
    setInfoAberta(true);
    setPesquisaAberta(false);
    setTermoPesquisa("");
    setResultadosPesquisa([]);

    // Centralizar mapa e desenhar círculo ao redor do veículo
    if (mapRef.current?.centralizarEDesenharCirculo) {
      mapRef.current.centralizarEDesenharCirculo(veiculo.lat, veiculo.lng);
    }
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
                <span className="text-sm font-medium">SEMED (GEDUC)</span>
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
              VEÍCULOS
            </h2>
            <div className="space-y-3">
              <div className="rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <button
                  onClick={() => setExpandidoCarros(!expandidoCarros)}
                  className="flex w-full cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-zinc-900"
                    checked={tiposAtivos.includes("CARRO")}
                    onChange={() => handleTipoCheckboxChange("CARRO")}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-medium flex-1">CARROS</span>
                  <span className="text-xs text-zinc-500">
                    {veiculos.filter(v => v.tipo === "CARRO" || !v.tipo).length}
                  </span>
                  <span className="text-xs">
                    {expandidoCarros ? "▼" : "▶"}
                  </span>
                </button>
                {expandidoCarros && (
                  <div className="mt-3 ml-4 space-y-2 border-l-2 border-zinc-200 pl-3">
                    {veiculos.filter(v => v.tipo === "CARRO" || !v.tipo).map((veiculo) => (
                      <label key={veiculo.id} className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          className="h-3 w-3 accent-zinc-900"
                          checked={!veiculosDesabilitados?.includes(veiculo.id)}
                          onChange={() => handleVeiculoToggle(veiculo.id)}
                        />
                        <span className="truncate">{veiculo.nome}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-md border border-zinc-200 px-3 py-3 transition hover:bg-zinc-50">
                <button
                  onClick={() => setExpandidoMotos(!expandidoMotos)}
                  className="flex w-full cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-zinc-900"
                    checked={tiposAtivos.includes("MOTO")}
                    onChange={() => handleTipoCheckboxChange("MOTO")}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-medium flex-1">MOTOS</span>
                  <span className="text-xs text-zinc-500">
                    {veiculos.filter(v => v.tipo === "MOTO").length}
                  </span>
                  <span className="text-xs">
                    {expandidoMotos ? "▼" : "▶"}
                  </span>
                </button>
                {expandidoMotos && (
                  <div className="mt-3 ml-4 space-y-2 border-l-2 border-zinc-200 pl-3">
                    {veiculos.filter(v => v.tipo === "MOTO").map((veiculo) => (
                      <label key={veiculo.id} className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          className="h-3 w-3 accent-zinc-900"
                          checked={!veiculosDesabilitados?.includes(veiculo.id)}
                          onChange={() => handleVeiculoToggle(veiculo.id)}
                        />
                        <span className="truncate">{veiculo.nome}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
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

        <button
        type="button"
        className="absolute right-6 top-20 z-[1001] p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-2xl bg-white dark:bg-zinc-900"
        onClick={() => setPesquisaAberta(!pesquisaAberta)}>
          <HiMagnifyingGlass className="h-6 w-6 text-zinc-900 dark:text-white" />
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

      <aside
          className={`absolute right-0 top-0 z-[1002] h-screen w-[min(350px,88vw)] overflow-y-auto bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white p-6 shadow-2xl transition-all duration-300 ease-in-out rounded-lg ${
            pesquisaAberta ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Buscar Veículo</h1>
              <button
                onClick={() => {
                  setPesquisaAberta(false);
                  setTermoPesquisa("");
                  setResultadosPesquisa([]);
                }}
                type="button"
                className="text-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por placa ou código..."
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={termoPesquisa}
                onChange={(e) => buscarVeiculo(e.target.value)}
              />
            </div>

            {resultadosPesquisa.length > 0 ? (
              <div className="space-y-2">
                {resultadosPesquisa.map((veiculo) => (
                  <button
                    key={veiculo.id}
                    onClick={() => selecionarVeiculoDaBusca(veiculo)}
                    className="w-full text-left bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 p-4 rounded-lg transition cursor-pointer"
                  >
                    <p className="font-semibold text-sm">{veiculo.nome}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Placa: {veiculo.placa || "N/A"}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">ID: {veiculo.id}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Setor: {veiculo.setor}</p>
                  </button>
                ))}
              </div>
            ) : termoPesquisa.trim() !== "" ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center py-8">
                Nenhum veículo encontrado
              </p>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center py-8">
                Digite a placa ou código do veículo para buscar
              </p>
            )}
          </div>
        </aside>

      <div
        className="h-full w-full"
      >
        <MapComponent
          ref={mapRef}
          veiculos={veiculos}
          setoresAtivos={setoresAtivos}
          aparelhosAtivos={aparelhosAtivos}
          tiposAtivos={tiposAtivos}
          veiculosDesabilitados={veiculosDesabilitados}
          onVeiculoSelecionado={(veiculo) => {
            setVeiculoSelecionado(veiculo);
            setInfoAberta(true);
          }}
        />
      </div>
    </div>
  );
}
