import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";
import type { NodoRuta } from "../data/mock";

const COLORS: Record<NodoRuta["tipo"], string> = {
  parcela: "#34d399",
  acopio: "#fbbf24",
  puerto: "#60a5fa",
  destino: "#f472b6",
};

export function TraceMap({ ruta }: { ruta: NodoRuta[] }) {
  const positions = ruta.map((nodo) => nodo.coords);
  const center = positions[0] ?? [-9.3, -76];

  return (
    <div className="h-56 overflow-hidden rounded-2xl border border-white/10 md:h-[380px]">
      <MapContainer
        center={center}
        zoom={3}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Polyline
          positions={positions}
          pathOptions={{ color: "#34d399", weight: 3, opacity: 0.85 }}
        />
        {ruta.map((nodo) => (
          <CircleMarker
            key={nodo.id}
            center={nodo.coords}
            radius={nodo.tipo === "parcela" ? 10 : 8}
            pathOptions={{
              color: COLORS[nodo.tipo],
              fillColor: COLORS[nodo.tipo],
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <strong>{nodo.nombre}</strong>
              <br />
              {nodo.fecha ?? "Fecha por confirmar"} · {nodo.estado.replace("_", " ")}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
