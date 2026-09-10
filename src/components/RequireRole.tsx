import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { Role } from "../api/client";
import { homeFor, useAuth } from "../state/AuthContext";

export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#08110c] text-stone-400">
        Cargando sesión…
      </div>
    );
  }
  if (!user) return <Navigate to={`/ingresar/${role}`} replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}
