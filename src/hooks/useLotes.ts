import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { FotoCampo, Lote, RankingFila } from "../data/mock";

export function useLotes() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    api<Lote[]>("/api/lotes")
      .then((data) => {
        setLotes(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { lotes, loading, error, reload };
}

export function useRanking() {
  const [ranking, setRanking] = useState<RankingFila[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    api<RankingFila[]>("/api/acopio/ranking")
      .then(setRanking)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ranking, loading, reload };
}

export function useFotosAcopio() {
  const [fotos, setFotos] = useState<FotoCampo[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    api<FotoCampo[]>("/api/acopio/fotos")
      .then(setFotos)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { fotos, loading, reload };
}
