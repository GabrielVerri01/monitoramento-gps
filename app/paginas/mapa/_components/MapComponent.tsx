"use client";

import { useEffect, useRef } from "react";
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
}

const CENTRO_INICIAL: [number, number] = [-2.5005, -44.2955];
const ZOOM_INICIAL = 13;

const CORES_SETORES: { [setor: string]: string } = {
  Logistica: "#3B82F6",
  Vendas: "#10B981",
  SEMUSC: "#F59E0B",
  SEMED: "#8B5CF6",
  SMTT: "#EC4899",
  BLITZ: "#EF4444",
  SEMAPA: "#06B6D4",
  SAMU: "#DC2626",
  GEDUC: "#FCD34D",
};

function gerarIconeOnibus(cor: string): string {
  const corSemHash = cor.replace("#", "");
  return `data:image/svg+xml,%3Csvg width='80' height='48' viewBox='0 0 111 66' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 8C0 3.58172 3.58172 0 8 0H90C94.4183 0 98 3.58172 98 8V57H0V8Z' fill='%23${corSemHash}' fill-opacity='0.75'/%3E%3Cpath d='M98 25H103C107.418 25 111 28.5817 111 33V57H98V25Z' fill='%23${corSemHash}' fill-opacity='0.75'/%3E%3Ccircle cx='22.5' cy='58.5' r='7.5' fill='%23D9D9D9'/%3E%3Ccircle cx='73.5' cy='58.5' r='7.5' fill='%23D9D9D9'/%3E%3Crect y='48' width='111' height='9' fill='%231E1E1E'/%3E%3Crect x='79' y='10' width='17' height='13' fill='%23D9D9D9'/%3E%3Crect x='40' y='12' width='11' height='11' rx='2' fill='%23D9D9D9'/%3E%3Crect x='22' y='12' width='11' height='11' rx='2' fill='%23D9D9D9'/%3E%3Crect x='4' y='12' width='11' height='11' rx='2' fill='%23D9D9D9'/%3E%3C/svg%3E`;
}

function gerarIconeSimples(cor: string, simbolo: string): string {
  const corSemHash = cor.replace("#", "");
  // Icone simples e genérico para outros setores
  return `data:image/svg+xml,%3Csvg width='20' height='30' viewBox='0 0 30 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='2' y='2' width='26' height='26' rx='4' fill='%23${corSemHash}'/%3E%3Ccircle cx='15' cy='15' r='5' fill='%23000000'/%3E%3Crect x='10' y='30' width='10' height='8' fill='%23000000'/%3E%3C/svg%3E`;
}

function gerarIconePorSetor(setor: string, cor: string): string {
  // GEDUC usa óculos
  if (setor === "GEDUC") {
    return gerarIconeOnibus(cor);
  }
  // Outros setores usam ícone simples
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

  return `<b>${carro.nome}</b>
    <br>Setor: ${carro.setor}
    <br>Aparelhos: ${aparelhos}
    <br>Velocidade: ${velocidade} km/h
    <br>Placa: ${placa}`;
}

export default function MapComponent({
  veiculos,
  setoresAtivos,
  aparelhosAtivos,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any | null>(null);
  const marcadoresRef = useRef<{ [id: string]: any }>({});
  const camadasRef = useRef<{ [setor: string]: any }>({});
  const Lref = useRef<any>(null);
  const circuloAtivoRef = useRef<any | null>(null);
  const rastrosRef = useRef<{ [id: string]: Array<[number, number]> }>({});
  const polylinesRef = useRef<any | null>(null);
  const veiculoSelecionadoRef = useRef<string | null>(null);

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
    });

    return () => {
      mapa.remove();
      leafletMapRef.current = null;
    };
  }, [Lref]);

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
    const veiculosDentro: any[] = [];

    Object.entries(marcadoresRef.current).forEach(([id, marcador]) => {
      const posicaoMarcador = marcador.getLatLng();
      const distancia = calcularDistancia(latCirculo, lngCirculo, posicaoMarcador.lat, posicaoMarcador.lng);

    
      if (distancia <= raio) {
        const veiculo = veiculos.find(v => v.id === id);
        if (veiculo) {
          veiculosDentro.push(veiculo);
        }
      }
      // SE TA FORA NAO FAZ NADA 
    });

    // Mostrar popup com veículos encontrados
    if (veiculosDentro.length > 0) {
      mostrarPopupVeiculosDentro(latCirculo, lngCirculo, veiculosDentro, mapa);
    }
  }

  // Mostra popup com informações dos veículos encontrados
  function mostrarPopupVeiculosDentro(lat: number, lng: number, veiculosList: Veiculo[], mapa: any) {
    const L = Lref.current;
    if (!L) return;

    let conteudo = `<b>🚗 Veículos na área (${veiculosList.length}):</b><br><br>`;
    veiculosList.forEach(v => {
      conteudo += `<b>${v.nome}</b><br>`;
      conteudo += `Setor: ${v.setor}<br>`;
      conteudo += `Velocidade: ${v.velocidade || 0} km/h<br>`;
      conteudo += `Placa: ${v.placa || v.id}<br><br>`;
    });

    L.popup()
      .setLatLng([lat, lng])
      .setContent(conteudo)
      .openOn(mapa);
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

    const raio = 1000; // 1km
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

    // Adiciona evento de clique para mostrar rastro
    novoMarcador.on("click", () => {
      desenharRastroVeiculo(carro.id, carro.nome);
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