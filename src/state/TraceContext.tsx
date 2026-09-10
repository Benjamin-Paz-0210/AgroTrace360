import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  lotesSemilla,
  type BitacoraEntry,
  type BitacoraTipo,
  type Lote,
  type Role,
} from "../data/mock";

type TraceContextValue = {
  lotes: Lote[];
  getLote: (id: string) => Lote | undefined;
  lotesDeProductor: (productorId: string) => Lote[];
  agregarBitacora: (
    loteId: string,
    input: {
      tipo: BitacoraTipo;
      titulo: string;
      nota: string;
      autor: string;
      rol: Role;
    },
  ) => void;
};

const TraceContext = createContext<TraceContextValue | null>(null);

export function TraceProvider({ children }: { children: ReactNode }) {
  const [lotes, setLotes] = useState<Lote[]>(() => lotesSemilla());

  const value = useMemo<TraceContextValue>(() => {
    return {
      lotes,
      getLote: (id) => lotes.find((lote) => lote.id === id),
      lotesDeProductor: (productorId) =>
        lotes.filter((lote) => lote.productorId === productorId),
      agregarBitacora: (loteId, input) => {
        const entry: BitacoraEntry = {
          id: `b-${Date.now()}`,
          fecha: new Date().toISOString().slice(0, 10),
          ...input,
        };
        setLotes((prev) =>
          prev.map((lote) =>
            lote.id === loteId
              ? { ...lote, bitacora: [entry, ...lote.bitacora] }
              : lote,
          ),
        );
      },
    };
  }, [lotes]);

  return (
    <TraceContext.Provider value={value}>{children}</TraceContext.Provider>
  );
}

export function useTrace(): TraceContextValue {
  const ctx = useContext(TraceContext);
  if (!ctx) throw new Error("useTrace fuera de TraceProvider");
  return ctx;
}
