import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from "lucide-react";

export type ToastTipo = "ok" | "error" | "info";

type Toast = {
  id: string;
  tipo: ToastTipo;
  titulo: string;
  texto?: string;
};

type ConfirmOpts = {
  titulo: string;
  texto: string;
  ok?: string;
  cancelar?: string;
  peligro?: boolean;
};

type NoticeContextValue = {
  toast: (t: Omit<Toast, "id">) => void;
  confirmar: (opts: ConfirmOpts) => Promise<boolean>;
};

const NoticeContext = createContext<NoticeContextValue | null>(null);

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(
    null,
  );

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((xs) => [...xs.slice(-3), { ...t, id }]);
    window.setTimeout(() => {
      setToasts((xs) => xs.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const confirmar = useCallback((opts: ConfirmOpts) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ ...opts, resolve });
    });
  }, []);

  const value = useMemo(() => ({ toast, confirmar }), [toast, confirmar]);

  function cerrarDialogo(ok: boolean) {
    dialog?.resolve(ok);
    setDialog(null);
  }

  useEffect(() => {
    if (!dialog) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dialog.resolve(false);
        setDialog(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [dialog]);

  return (
    <NoticeContext.Provider value={value}>
      {children}

      {dialog ? (
        <div className="fixed inset-0 z-80 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="notice-backdrop absolute inset-0 bg-[#0a0705]/75 backdrop-blur-md"
            aria-label="Cerrar"
            onClick={() => cerrarDialogo(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-titulo"
            className="notice-card relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-amber-200/20 bg-[#1a140f] shadow-[0_28px_80px_rgba(0,0,0,0.6)]"
          >
            <div className="h-1 bg-linear-to-r from-amber-500 via-amber-300 to-emerald-400" />
            <div className="p-6">
              <div
                className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${
                  dialog.peligro
                    ? "bg-red-500/15 text-red-300 ring-1 ring-red-400/20"
                    : "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/20"
                }`}
              >
                {dialog.peligro ? (
                  <Trash2 className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
              <p id="notice-titulo" className="font-serif text-2xl text-white">
                {dialog.titulo}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone-400">{dialog.texto}</p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => cerrarDialogo(false)}
                  className="min-h-11 rounded-full border border-white/12 px-5 py-2 text-sm text-stone-300 transition hover:border-white/25 hover:text-white"
                >
                  {dialog.cancelar ?? "Cancelar"}
                </button>
                <button
                  type="button"
                  onClick={() => cerrarDialogo(true)}
                  className={`min-h-11 rounded-full px-5 py-2 text-sm font-semibold transition ${
                    dialog.peligro
                      ? "bg-red-500 text-white hover:bg-red-400"
                      : "bg-amber-400 text-[#1a120c] hover:bg-amber-300"
                  }`}
                >
                  {dialog.ok ?? "Aceptar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-70 flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <ToastCard
            key={t.id}
            toast={t}
            onClose={() => setToasts((xs) => xs.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </NoticeContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const tono =
    toast.tipo === "ok"
      ? "border-emerald-400/25 bg-[#0e1a14]/95 text-emerald-100"
      : toast.tipo === "error"
        ? "border-red-400/25 bg-[#1c1010]/95 text-red-100"
        : "border-amber-400/25 bg-[#1a140c]/95 text-amber-100";
  const barra =
    toast.tipo === "ok"
      ? "bg-emerald-400"
      : toast.tipo === "error"
        ? "bg-red-400"
        : "bg-amber-400";
  const Icon =
    toast.tipo === "ok" ? CheckCircle2 : toast.tipo === "error" ? AlertTriangle : Info;

  return (
    <div
      className={`toast-card pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md ${tono}`}
    >
      <div className="flex items-start gap-3 px-4 pt-3 pb-2.5">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/6">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{toast.titulo}</p>
          {toast.texto ? (
            <p className="mt-0.5 text-xs leading-relaxed opacity-80">{toast.texto}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-0.5 bg-white/8">
        <div className={`toast-life h-full ${barra}`} />
      </div>
    </div>
  );
}

export function useNotice() {
  const ctx = useContext(NoticeContext);
  if (!ctx) throw new Error("useNotice debe usarse dentro de NoticeProvider");
  return ctx;
}
