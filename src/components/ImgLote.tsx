import { useState } from "react";

export function ImgLote({
  src,
  fallbackSrc,
  alt = "",
  className = "",
}: {
  src: string;
  fallbackSrc?: string | null;
  alt?: string;
  className?: string;
}) {
  const [fase, setFase] = useState<"src" | "fallback" | "vacio">("src");
  const actual = fase === "fallback" ? fallbackSrc || "" : fase === "src" ? src : "";

  if (fase === "vacio" || !actual) {
    return (
      <div
        className={`grid place-items-center bg-[#0c1410] text-center text-[11px] text-stone-500 ${className}`}
      >
        Foto no disponible
      </div>
    );
  }

  return (
    <img
      src={actual}
      alt={alt}
      className={className}
      onError={() => {
        if (fase === "src" && fallbackSrc && fallbackSrc !== src) setFase("fallback");
        else setFase("vacio");
      }}
    />
  );
}
