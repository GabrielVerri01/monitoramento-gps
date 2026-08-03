"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export interface Veiculo {
  id: string;
  nome: string;
  setor: string;
  aparelhos: string[];
  velocidade: number;
  placa: string;
  lat: number;
  lng: number;
}

interface MapComponentProps {
  veiculos: Veiculo[];
  setoresAtivos: string[];
  aparelhosAtivos: string[];
}

const CENTRO_INICIAL: L.LatLngTuple = [-2.5005, -44.2955];  //-23.55052, -46.633308 is São Paulo, Brazil
const ZOOM_INICIAL = 13;

// Corrige o bug conhecido de ícone quebrado(L) do Leaflet com Webpack/Next.
// Só precisa rodar uma vez (fora do componente), não a cada render/effect.
const ICONE_PADRAO = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = ICONE_PADRAO;

function veiculoDeveAparecer(
  carro: Veiculo,
  setoresAtivos: string[],
  aparelhosAtivos: string[]
): boolean {
  const setorAtivo = setoresAtivos.includes(carro.setor);
  const aparelhoAtivo = carro.aparelhos.some((a) => aparelhosAtivos.includes(a));
  return setorAtivo && aparelhoAtivo;
}

function montarPopup(carro: Veiculo): string {
  return `<b>${carro.nome}</b>
    <br>Setor: ${carro.setor}
    <br>Aparelhos: ${carro.aparelhos.join(", ")}
    <br>Velocidade: ${carro.velocidade} km/h
    <br>Placa: ${carro.placa}`;
}

export default function MapComponent({
  veiculos,
  setoresAtivos,
  aparelhosAtivos,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const marcadoresRef = useRef<{ [id: string]: L.Marker }>({});
  const camadasRef = useRef<{ [setor: string]: L.LayerGroup }>({});

  // aqui incia mapa com as camadas de rua do OpenStreetMap
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

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
  }, []);

  // Sincroniza camadas por setor (mostra/esconde conforme filtro)
  function sincronizarCamadasDeSetor(mapa: L.Map) {
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
  function criarOuAtualizarMarcador(carro: Veiculo, mapa: L.Map) {
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