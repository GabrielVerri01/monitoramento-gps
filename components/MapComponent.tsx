"use client"; // Importante: Garante que é um Client Component

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 1. Tipando a estrutura do nosso veículo
export interface Veiculo {
  id: string;
  nome: string;
  setor: string;
  lat: number;
  lng: number;
}

interface MapComponentProps {
  veiculos: Veiculo[];
  setoresAtivos: string[];
}

export default function MapComponent({ veiculos, setoresAtivos }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  
  // Guardamos as referências dos marcadores e das camadas usando refs
  const marcadoresRef = useRef<{ [key: string]: L.Marker }>({});
  const camadasRef = useRef<{ [key: string]: L.LayerGroup }>({});

  // Efeito para inicializar o mapa (Roda apenas uma vez)
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Inicializa o mapa focado em uma coordenada inicial
    const mapa = L.map(mapRef.current).setView([-23.55052, -46.633308], 13);
    leafletMapRef.current = mapa;

    // Adiciona as ruas do OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);

    // Corrige um bug conhecido de ícone quebrado no Leaflet com Webpack/Next
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    return () => {
      mapa.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Efeito que lida com a atualização dos dados de GPS e com os filtros de setor
  useEffect(() => {
    const mapa = leafletMapRef.current;
    if (!mapa) return;

    // 1. Limpa camadas antigas que não estão mais ativas nos filtros
    Object.keys(camadasRef.current).forEach((setor) => {
      if (!setoresAtivos.includes(setor)) {
        mapa.removeLayer(camadasRef.current[setor]);
      } else if (!mapa.hasLayer(camadasRef.current[setor])) {
        mapa.addLayer(camadasRef.current[setor]);
      }
    });

    // 2. Processa os veículos que vieram da API/State
    veiculos.forEach((carro) => {
      // Se o setor do carro não está ativo no filtro, não fazemos nada
      if (!setoresAtivos.includes(carro.setor)) return;

      // Se a camada daquele setor ainda não existe, criamos ela
      if (!camadasRef.current[carro.setor]) {
        camadasRef.current[carro.setor] = L.layerGroup().addTo(mapa);
      }

      const camadaDoSetor = camadasRef.current[carro.setor];

      // Se o marcador do carro já existe, apenas atualizamos a posição (Tempo Real!)
      if (marcadoresRef.current[carro.id]) {
        marcadoresRef.current[carro.id].setLatLng([carro.lat, carro.lng]);
      } else {
        // Se é um carro novo, cria o pino e o vincula à camada do setor correto
        const novoMarcador = L.marker([carro.lat, carro.lng]).bindPopup(
          `<b>${carro.nome}</b><br>Setor: ${carro.setor}`
        );

        marcadoresRef.current[carro.id] = novoMarcador;
        novoMarcador.addTo(camadaDoSetor);
      }
    });
  }, [veiculos, setoresAtivos]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}