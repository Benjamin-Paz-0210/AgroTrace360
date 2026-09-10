import { BookOpen, Images, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ChipNav } from "./ChipNav";

const ITEMS = [
  { to: "/acopio", label: "Productores", short: "Registro", icon: Users, end: true },
  { to: "/acopio/fotos", label: "Fotos de campo", short: "Fotos", icon: Images, end: false },
  { to: "/acopio/catalogo", label: "Catálogo", short: "Fichas", icon: BookOpen, end: false },
];

export function AcopioNav() {
  const { pathname } = useLocation();
  if (!pathname.startsWith("/acopio")) return null;
  return <ChipNav items={ITEMS} />;
}
