"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import "leaflet/dist/leaflet.css";

export interface Veiculo {
  id: string;
  nome: string;
  setor: string;
  aparelhos?: string[];
  velocidade?: number;
  placa?: string;
  lat: number;
  lng: number;
}

interface MapComponentProps {
  veiculos: Veiculo[];
  setoresAtivos: string[];
  aparelhosAtivos: string[];
  onVeiculoSelecionado?: (veiculo: Veiculo) => void;
}

const CENTRO_INICIAL: [number, number] = [-2.5005, -44.2955];
const ZOOM_INICIAL = 13;

const CORES_SETORES: { [setor: string]: string } = {
  SEMUSC: "#F59E0B",
  SEMED: "#8B5CF6",
  SMTT: "#494045",
  BLITZ: "#EF4444",
  SEMAPA: "#06B6D4",
  SAMU: "#DC2626",
  GEDUC: "#FCD34D",
  SEMIT: "#14B8A6",
};

function gerarIconeOnibus(cor: string): string {
  const corSemHash = cor.replace("#", "");
  return `data:image/svg+xml,%3Csvg width='80' height='48' viewBox='0 0 111 66' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 8C0 3.58172 3.58172 0 8 0H90C94.4183 0 98 3.58172 98 8V57H0V8Z' fill='%23${corSemHash}' fill-opacity='0.75'/%3E%3Cpath d='M98 25H103C107.418 25 111 28.5817 111 33V57H98V25Z' fill='%23${corSemHash}' fill-opacity='0.75'/%3E%3Ccircle cx='22.5' cy='58.5' r='7.5' fill='%23D9D9D9'/%3E%3Ccircle cx='73.5' cy='58.5' r='7.5' fill='%23D9D9D9'/%3E%3Crect y='48' width='111' height='9' fill='%231E1E1E'/%3E%3Crect x='79' y='10' width='17' height='13' fill='%23D9D9D9'/%3E%3Crect x='40' y='12' width='11' height='11' rx='2' fill='%23D9D9D9'/%3E%3Crect x='22' y='12' width='11' height='11' rx='2' fill='%23D9D9D9'/%3E%3Crect x='4' y='12' width='11' height='11' rx='2' fill='%23D9D9D9'/%3E%3C/svg%3E`;
}

function gerarIconeSMTT(cor: string): string {
  const corSemHash = cor.replace("#", "")
  return `data:image/svg+xml,<svg width='80' height='48' viewBox='0 0 680 360' xmlns='http://www.w3.org/2000/svg'><path d='M195 250 L195 210 Q195 195 210 190 L255 175 Q265 155 285 155 L400 155 Q420 155 430 175 L470 190 Q485 195 485 210 L485 250 Z' fill='%234a4e54' stroke='%2333363b' stroke-width='1.5'/><rect x='195' y='212' width='290' height='24' fill='%231c1c1c'/><path d='M262 178 L282 160 L400 160 L416 178 Z' fill='%235c6570' stroke='%23454c55' stroke-width='1'/><line x1='340' y1='160' x2='340' y2='178' stroke='%23454c55' stroke-width='1.5'/><rect x='290' y='140' width='100' height='16' rx='3' fill='%231c1c1c'/><rect x='290' y='140' width='50' height='16' rx='3' fill='%23e63946'/><rect x='340' y='140' width='50' height='16' rx='3' fill='%233d8bef'/><circle cx='230' cy='224' r='9' fill='%23ffd166'/><circle cx='480' cy='222' r='6' fill='%23ffd166'/><rect x='185' y='245' width='310' height='10' rx='4' fill='%2333363b'/><circle cx='250' cy='260' r='26' fill='%23111111'/><circle cx='250' cy='260' r='10' fill='%236b6b6b'/><circle cx='450' cy='260' r='26' fill='%23111111'/><circle cx='450' cy='260' r='10' fill='%236b6b6b'/></svg>`
}

function gerarIconeSAMU(cor: string): string {
  const corSemHash = cor.replace("#", "")
  return `data:image/svg+xml,<svg width='80' height='48' viewBox='0 0 680 360' xmlns='http://www.w3.org/2000/svg'><rect x='230' y='150' width='180' height='100' rx='6' fill='%23e63946' stroke='%23c62f3b' stroke-width='1.5'/><path d='M410 150 L455 150 Q470 150 475 165 L485 215 L485 250 L410 250 Z' fill='%23e63946' stroke='%23c62f3b' stroke-width='1.5'/><path d='M418 165 L450 165 Q457 165 459 173 L463 205 L418 205 Z' fill='%23a8d8ef' stroke='%238cc4e0' stroke-width='1'/><g fill='%23ffffff'><rect x='295' y='173' width='50' height='16' rx='2'/><rect x='313' y='155' width='16' height='52' rx='2'/></g><rect x='290' y='132' width='60' height='18' rx='4' fill='%232b2b2b'/><rect x='290' y='132' width='30' height='18' rx='4' fill='%233d8bef'/><rect x='320' y='132' width='30' height='18' rx='4' fill='%23e63946'/><circle cx='477' cy='230' r='6' fill='%23ffd166'/><rect x='220' y='245' width='275' height='10' rx='4' fill='%23d9d9d9'/><circle cx='270' cy='260' r='26' fill='%232b2b2b'/><circle cx='270' cy='260' r='10' fill='%238a8a8a'/><circle cx='440' cy='260' r='26' fill='%232b2b2b'/><circle cx='440' cy='260' r='10' fill='%238a8a8a'/></svg>`
}

function gerarIconeSEMIT(cor: string): string {
  const corSemHash = cor.replace("#", "")
  return `data:image/svg+xml,<svg width='80' height='48' viewBox='0 0 680 360' xmlns='http://www.w3.org/2000/svg'><path d='M195 250 L195 210 Q195 195 210 190 L255 175 Q265 155 285 155 L400 155 Q420 155 430 175 L470 190 Q485 195 485 210 L485 250 Z' fill='%232456a6' stroke='%231a3f80' stroke-width='1.5'/><rect x='195' y='200' width='290' height='8' fill='%232ecc71'/><rect x='195' y='208' width='290' height='8' fill='%23ffd166'/><path d='M262 178 L282 160 L400 160 L416 178 Z' fill='%23a8d8ef' stroke='%238cc4e0' stroke-width='1'/><line x1='340' y1='160' x2='340' y2='178' stroke='%238cc4e0' stroke-width='1.5'/><text x='340' y='233' text-anchor='middle' font-size='18' font-weight='500' font-family='Arial, sans-serif' fill='%23ffffff'>SEMIT</text><circle cx='480' cy='222' r='6' fill='%23ffd166'/><rect x='185' y='245' width='310' height='10' rx='4' fill='%231a3f80'/><circle cx='250' cy='260' r='26' fill='%23111111'/><circle cx='250' cy='260' r='10' fill='%236b6b6b'/><circle cx='450' cy='260' r='26' fill='%23111111'/><circle cx='450' cy='260' r='10' fill='%236b6b6b'/></svg>`
}

function gerarIconeSimples(cor: string, simbolo: string): string {
  const corSemHash = cor.replace("#", "");
  // Icone simples e genérico para outros setores
  return `data:image/svg+xml,%3Csvg width='20' height='30' viewBox='0 0 30 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='2' y='2' width='26' height='26' rx='4' fill='%23${corSemHash}'/%3E%3Ccircle cx='15' cy='15' r='5' fill='%23000000'/%3E%3Crect x='10' y='30' width='10' height='8' fill='%23000000'/%3E%3C/svg%3E`;
}

function gerarIconePorSetor(setor: string, cor: string): string {
  // GEDUC usa onibus feito no figma 
  if (setor === "GEDUC") {
    return gerarIconeOnibus(cor);
  }
  // por enquanto icone simples para outros setores
  return gerarIconeSimples(cor, setor);
}

function veiculoDeveAparecer(
  carro: Veiculo,
  setoresAtivos: string[],
  aparelhosAtivos: string[]
): boolean {
  const setorAtivo = setoresAtivos.includes(carro.setor);
  const aparelhos = carro.aparelhos || ["GPS"];
  const aparelhoAtivo = aparelhos.some((a) => aparelhosAtivos.includes(a));
  return setorAtivo && aparelhoAtivo;
}

function montarPopup(carro: Veiculo): string {
  const aparelhos = (carro.aparelhos || ["GPS"]).join(", ");
  const velocidade = carro.velocidade || 0;
  const placa = carro.placa || carro.id;
  // const curso = carro.curso !== undefined ? `Curso: ${carro.curso}°` : "Curso: N/A";  CASO EU QUEIRA A DIRECAO

  return `<b>${carro.nome}</b>
    <br>Setor: ${carro.setor}
    <br>Aparelhos: ${aparelhos}
    <br>Velocidade: ${velocidade} km/h
    <br>Placa: ${placa}
    `;
    // CASO EU QUEIRA A DIRECAO devo adiconar <br>${curso} 
}

const MapComponent = forwardRef<any, MapComponentProps>(
  ({
    veiculos,
    setoresAtivos,
    aparelhosAtivos,
    onVeiculoSelecionado,
  }: MapComponentProps, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any | null>(null);
  const marcadoresRef = useRef<{ [id: string]: any }>({});
  const camadasRef = useRef<{ [setor: string]: any }>({});
  const Lref = useRef<any>(null);
  const circuloAtivoRef = useRef<any | null>(null);
  const rastrosRef = useRef<{ [id: string]: Array<[number, number]> }>({});
  const polylinesRef = useRef<any | null>(null);
  const veiculoSelecionadoRef = useRef<string | null>(null);
  const veiculosDentroCirculoRef = useRef<Set<string>>(new Set());

  // Carrega Leaflet apenas no cliente
  useEffect(() => {
    if (typeof window !== "undefined" && !Lref.current) {
      const L = require("leaflet");
      Lref.current = L;
    }
  }, []);

  // Inicializa o mapa quando o Leaflet estiver carregado
  useEffect(() => {
    if (!Lref.current || !mapRef.current || leafletMapRef.current) return;

    const L = Lref.current;
    const mapa = L.map(mapRef.current).setView(CENTRO_INICIAL, ZOOM_INICIAL);
    leafletMapRef.current = mapa;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa);


    // Adiciona evento de clique no mapa para desenhar círculo em qualquer lugar
    mapa.on("click", (e: any) => {
      desenharCirculo(e.latlng.lat, e.latlng.lng, mapa);
      // montarPopupDeArea(e.latlng.lat, e.latlng.lng, []); // Inicialmente vazio, será atualizado em verificarVeiculosDentroCirculo
    });

    return () => {
      mapa.remove();
      leafletMapRef.current = null;
    };
  }, [Lref]);

  useImperativeHandle(ref, () => ({
    centralizarEDesenharCirculo: (lat: number, lng: number) => { //centraliza carro pesquisado e desenha circulo
      const mapa = leafletMapRef.current;
      if (!mapa) return;

      mapa.setView([lat, lng], 15);
      desenharCirculo(lat, lng, mapa);
    }
  }));

  // Sincroniza camadas por setor (mostra/esconde conforme filtro)
  function sincronizarCamadasDeSetor(mapa: any) {
    Object.keys(camadasRef.current).forEach((setor) => {
      const camada = camadasRef.current[setor];
      if (!setoresAtivos.includes(setor)) {
        mapa.removeLayer(camada);
      } else if (!mapa.hasLayer(camada)) {
        mapa.addLayer(camada);
      }
    });
  }


  // Calcula distância entre dois pontos usando Fórmula de Haversine
  function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; //raio terra km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // converte em metros
  }

  function verificarVeiculosDentroCirculo(latCirculo: number, lngCirculo: number, raio: number, mapa: any) {
    const idsVerificados = new Set<string>();

    Object.entries(marcadoresRef.current).forEach(([id, marcador]) => {
      const posicaoMarcador = (marcador as any).getLatLng();
      const distancia = calcularDistancia(latCirculo, lngCirculo, posicaoMarcador.lat, posicaoMarcador.lng);

      if (distancia <= raio) {
          idsVerificados.add(id);
      }
    });

    // Armazena IDs dos veículos dentro do círculo
    veiculosDentroCirculoRef.current = idsVerificados;
  }


  //RASTRO
  function desenharRastroVeiculo(veiculoId: string, nomeVeiculo: string) {
    const L = Lref.current;
    const mapa = leafletMapRef.current;
    if (!L || !mapa) return;

    // Armazena qual veículo está sendo visualizado
    veiculoSelecionadoRef.current = veiculoId;

    // Remove polyline/rastro anterior
    if (polylinesRef.current) {
      mapa.removeLayer(polylinesRef.current);
      polylinesRef.current = null;
    }

    // se nao tiver historico, da alerta 
    if (!rastrosRef.current[veiculoId] || rastrosRef.current[veiculoId].length === 0) {
      alert(`Sem histórico de movimento para ${nomeVeiculo}`);
      return;
    }

    // Pega a cor do veículo pelo setor
    const veiculo = veiculos.find(v => v.id === veiculoId);
    const cor = veiculo ? CORES_SETORES[veiculo.setor] || "#3B82F6" : "#3B82F6";

    // Desenha a polyline com o histórico
    const polyline = L.polyline(rastrosRef.current[veiculoId], {
      color: "#b30f0f",  //cor do rastro
      weight: 2,  //comprimento do rastro
      opacity: 0.7,
      dashArray: "5, 5"
    }).addTo(mapa);

    polylinesRef.current = polyline;
  }

  // ATUALIZA DADOS AUTOMATICAMENTE 
  function atualizarRastroAtivo() {
    if (!veiculoSelecionadoRef.current) return;

    const L = Lref.current;
    const mapa = leafletMapRef.current;
    if (!L || !mapa) return;

    const veiculoId = veiculoSelecionadoRef.current;
    const veiculo = veiculos.find(v => v.id === veiculoId);
    if (!veiculo) return;

    // Remove polyline/rastro anterior
    if (polylinesRef.current) {
      mapa.removeLayer(polylinesRef.current);
    }

    // REDESENHA RASTRO(PRECISA DE HISTORICO)
    if (rastrosRef.current[veiculoId] && rastrosRef.current[veiculoId].length > 0) {
      const cor = CORES_SETORES[veiculo.setor] || "#3B82F6";
      const polyline = L.polyline(rastrosRef.current[veiculoId], {
        color: "#b30f0f", //cor do rastro
        weight: 2,  //comprimento do rastro
        opacity: 0.7,
        dashArray: "5, 5"
      }).addTo(mapa);
      polylinesRef.current = polyline;
    }
  }

  //AREA
  function desenharCirculo(lat: number, lng: number, mapa: any) {
    const L = Lref.current;
    if (!L) return;

    if (circuloAtivoRef.current) {
      mapa.removeLayer(circuloAtivoRef.current);
    }

    const raio = 1000; // 1km, diametro = 2km
    const novoCirculo = L.circle([lat, lng], {
      radius: raio,
      color: "#ff7800",
      weight: 2,
      opacity: 0.7,
      fill: true,
      fillColor: "#ff7800",
      fillOpacity: 0.1,
    }).addTo(mapa);

    circuloAtivoRef.current = novoCirculo;

    // Verifica veículos dentro do círculo
    verificarVeiculosDentroCirculo(lat, lng, raio, mapa);
  }

  // Cria ou atualiza o marcador de um veículo visível
  function criarOuAtualizarMarcador(carro: Veiculo, mapa: any) {
    const L = Lref.current;
    if (!L) return;

    // Armazena/atualiza histórico de posições
    if (!rastrosRef.current[carro.id]) {
      rastrosRef.current[carro.id] = [];
    }
    rastrosRef.current[carro.id].push([carro.lat, carro.lng]);

    // Limita a 50 posições para evitar crescimento infinito da memória
    if (rastrosRef.current[carro.id].length > 50) {
      rastrosRef.current[carro.id].shift();
    }

    if (!camadasRef.current[carro.setor]) {
      camadasRef.current[carro.setor] = L.layerGroup().addTo(mapa);
    }
    const camadaDoSetor = camadasRef.current[carro.setor];
    const marcadorExistente = marcadoresRef.current[carro.id];

    const cor = CORES_SETORES[carro.setor] || "#3B82F6";
    const icone = L.icon({
      iconUrl: gerarIconePorSetor(carro.setor, cor),
      iconSize: carro.setor === "GEDUC" ? [24, 18] : [20, 28],
      iconAnchor: carro.setor === "GEDUC" ? [12, 18] : [10, 28],
      popupAnchor: [0, carro.setor === "GEDUC" ? -18 : -28],
    });

    if (marcadorExistente) {
      marcadorExistente.setLatLng([carro.lat, carro.lng]);
      marcadorExistente.setPopupContent(montarPopup(carro));
      marcadorExistente.setIcon(icone);
      if (!camadaDoSetor.hasLayer(marcadorExistente)) {
        marcadorExistente.addTo(camadaDoSetor);
      }
      return;
    }

    const novoMarcador = L.marker([carro.lat, carro.lng], { icon: icone }).bindPopup(
      montarPopup(carro)
    );

    // Adiciona evento de clique para mostrar rastro e informações
    novoMarcador.on("click", () => {
      desenharRastroVeiculo(carro.id, carro.nome);

      // Só abre aba lateral se estiver dentro do círculo
      if (veiculosDentroCirculoRef.current.has(carro.id)) {
        if (onVeiculoSelecionado) {
          onVeiculoSelecionado(carro);
        }
      }
    });

    marcadoresRef.current[carro.id] = novoMarcador;
    novoMarcador.addTo(camadaDoSetor);
  }

  // Remove marcadores de veículos que sumiram da lista (ex: rastreador desligado)
  function removerVeiculosObsoletos(veiculosAtuais: Veiculo[]) {
    const idsAtuais = new Set(veiculosAtuais.map((v) => v.id));
    Object.keys(marcadoresRef.current).forEach((id) => {
      if (!idsAtuais.has(id)) {
        marcadoresRef.current[id].remove();
        delete marcadoresRef.current[id];
      }
    });
  }

  // Efeito que sincroniza dados de GPS e filtros com o mapa
  useEffect(() => {
    const mapa = leafletMapRef.current;
    if (!mapa) return;

    sincronizarCamadasDeSetor(mapa);
    removerVeiculosObsoletos(veiculos);

    veiculos.forEach((carro) => {
      const deveMostrar = veiculoDeveAparecer(carro, setoresAtivos, aparelhosAtivos);
      const marcador = marcadoresRef.current[carro.id];
      const camada = camadasRef.current[carro.setor];

      if (!deveMostrar) {
        if (marcador && camada?.hasLayer(marcador)) {
          camada.removeLayer(marcador);
        }
        return;
      }

      criarOuAtualizarMarcador(carro, mapa);
    });

    // Atualiza o rastro ativo se houver um veículo selecionado
    atualizarRastroAtivo();
  }, [veiculos, setoresAtivos, aparelhosAtivos]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
  }
);

MapComponent.displayName = "MapComponent";
export default MapComponent;