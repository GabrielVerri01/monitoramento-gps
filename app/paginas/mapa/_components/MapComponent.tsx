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

const ICONE_CARRINHO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3C!-- Sombra --%3E%3Cellipse cx='50' cy='55' rx='35' ry='4' fill='%23000' opacity='0.15'/%3E%3C!-- Roda traseira --%3E%3Ccircle cx='25' cy='45' r='8' fill='%23333'/%3E%3Ccircle cx='25' cy='45' r='5' fill='%23555'/%3E%3C!-- Roda dianteira --%3E%3Ccircle cx='75' cy='45' r='8' fill='%23333'/%3E%3Ccircle cx='75' cy='45' r='5' fill='%23555'/%3E%3C!-- Corpo traseiro --%3E%3Crect x='10' y='28' width='20' height='18' rx='3' fill='%23e8e8e8'/%3E%3C!-- Corpo principal --%3E%3Crect x='30' y='20' width='40' height='26' rx='4' fill='%23f5f5f5'/%3E%3C!-- Corpo dianteiro (mais fino) --%3E%3Crect x='70' y='28' width='15' height='18' rx='3' fill='%23f0f0f0'/%3E%3C!-- Janela traseira --%3E%3Crect x='13' y='30' width='14' height='10' rx='2' fill='%2390CAF9'/%3E%3C!-- Janela lateral traseira --%3E%3Crect x='33' y='22' width='12' height='12' rx='2' fill='%2390CAF9'/%3E%3C!-- Janela lateral dianteira --%3E%3Crect x='55' y='22' width='12' height='12' rx='2' fill='%2390CAF9'/%3E%3C!-- Pára-choque traseiro --%3E%3Crect x='10' y='44' width='20' height='3' fill='%23999'/%3E%3C!-- Pára-choque dianteiro --%3E%3Crect x='70' y='44' width='15' height='3' fill='%23999'/%3E%3C/svg%3E`;

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

  // Carrega Leaflet apenas no cliente
  useEffect(() => {
    if (typeof window !== "undefined" && !Lref.current) {
      const L = require("leaflet");
      Lref.current = L;
      L.Marker.prototype.options.icon = L.icon({
        iconUrl: ICONE_CARRINHO,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
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

  // Cria ou atualiza o marcador de um veículo visível
  function criarOuAtualizarMarcador(carro: Veiculo, mapa: any) {
    const L = Lref.current;
    if (!L) return;

    if (!camadasRef.current[carro.setor]) {
      camadasRef.current[carro.setor] = L.layerGroup().addTo(mapa);
    }
    const camadaDoSetor = camadasRef.current[carro.setor];
    const marcadorExistente = marcadoresRef.current[carro.id];

    if (marcadorExistente) {
      marcadorExistente.setLatLng([carro.lat, carro.lng]);
      marcadorExistente.setPopupContent(montarPopup(carro));
      if (!camadaDoSetor.hasLayer(marcadorExistente)) {
        marcadorExistente.addTo(camadaDoSetor);
      }
      return;
    }

    const novoMarcador = L.marker([carro.lat, carro.lng]).bindPopup(
      montarPopup(carro)
    );
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
  }, [veiculos, setoresAtivos, aparelhosAtivos]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}