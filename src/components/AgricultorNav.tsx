import { BookOpen, Camera, CloudSun, GalleryHorizontal, Grid2x2, Images, Layers, Store } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ChipNav } from "./ChipNav";

const ITEMS = [
  { to: "/agricultor", label: "Bitácora", short: "Bitácora", icon: BookOpen, end: true },
  { to: "/agricultor/camara", label: "Cámara IA", short: "Cámara", icon: Camera, end: false },
  { to: "/agricultor/galeria", label: "Galería", short: "Fotos", icon: GalleryHorizontal, end: false },
  { to: "/agricultor/catalogo", label: "Catálogo", short: "Fichas", icon: Images, end: false },
  { to: "/agricultor/tienda", label: "Tienda", short: "Tienda", icon: Store, end: false },
  { to: "/agricultor/suelo", label: "Sensores de suelo", short: "Suelo", icon: Layers, end: false },
  { to: "/agricultor/guias", label: "Clima y foliar", short: "Clima", icon: CloudSun, end: false },
  { to: "/agricultor/densidad", label: "Densidad", short: "Plantas", icon: Grid2x2, end: false },
];

export function AgricultorNav() {
  const { pathname } = useLocation();
  if (!pathname.startsWith("/agricultor")) return null;
  return <ChipNav items={ITEMS} />;
}
