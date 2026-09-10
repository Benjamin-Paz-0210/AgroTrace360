import { useState } from "react";

export function ImgLote({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [roto, setRoto] = useState(false);
  if (roto || !src) {
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
      src={src}
      alt={alt}
      className={className}
      onError={() => setRoto(true)}
    />
  );
}
