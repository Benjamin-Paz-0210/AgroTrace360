import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { RequireRole } from "./components/RequireRole";
import { AcopioFotosPage, AcopioPage, AcopioProductorPage } from "./pages/AcopioPage";
import { AgricultorPage } from "./pages/AgricultorPage";
import { CamaraPage } from "./pages/CamaraPage";
import { ExportadoraAcopioPage, ExportadoraHome, ExportadoraPage } from "./pages/ExportadoraPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { CatalogoPage } from "./pages/CatalogoPage";
import { SueloPage } from "./pages/SueloPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { GuiasPage } from "./pages/GuiasPage";
import { DensidadPage } from "./pages/DensidadPage";
import { PitchPage } from "./pages/PitchPage";
import { AuthProvider } from "./state/AuthContext";

function AcopioFicha() {
  const { productorId } = useParams();
  return <AcopioProductorPage productorId={productorId ?? ""} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pitch" element={<PitchPage />} />
          <Route path="/tienda" element={<MarketplacePage />} />
          <Route path="/ingresar/:rol" element={<LoginPage />} />
          <Route
            path="/agricultor"
            element={
              <RequireRole role="agricultor">
                <AgricultorPage />
              </RequireRole>
            }
          />
          <Route
            path="/agricultor/camara"
            element={
              <RequireRole role="agricultor">
                <CamaraPage />
              </RequireRole>
            }
          />
          <Route
            path="/agricultor/catalogo"
            element={
              <RequireRole role="agricultor">
                <CatalogoPage />
              </RequireRole>
            }
          />
          <Route
            path="/agricultor/tienda"
            element={
              <RequireRole role="agricultor">
                <MarketplacePage />
              </RequireRole>
            }
          />
          <Route
            path="/agricultor/suelo"
            element={
              <RequireRole role="agricultor">
                <SueloPage />
              </RequireRole>
            }
          />
          <Route
            path="/agricultor/guias"
            element={
              <RequireRole role="agricultor">
                <GuiasPage />
              </RequireRole>
            }
          />
          <Route
            path="/agricultor/densidad"
            element={
              <RequireRole role="agricultor">
                <DensidadPage />
              </RequireRole>
            }
          />
          <Route
            path="/acopio"
            element={
              <RequireRole role="acopio">
                <AcopioPage />
              </RequireRole>
            }
          />
          <Route
            path="/acopio/fotos"
            element={
              <RequireRole role="acopio">
                <AcopioFotosPage />
              </RequireRole>
            }
          />
          <Route
            path="/acopio/catalogo"
            element={
              <RequireRole role="acopio">
                <CatalogoPage />
              </RequireRole>
            }
          />
          <Route
            path="/acopio/:productorId"
            element={
              <RequireRole role="acopio">
                <AcopioFicha />
              </RequireRole>
            }
          />
          <Route
            path="/exportadora"
            element={
              <RequireRole role="exportadora">
                <ExportadoraHome />
              </RequireRole>
            }
          />
          <Route
            path="/exportadora/acopio/:acopioId"
            element={
              <RequireRole role="exportadora">
                <ExportadoraAcopioPage />
              </RequireRole>
            }
          />
          <Route
            path="/exportadora/lote/:loteId"
            element={
              <RequireRole role="exportadora">
                <ExportadoraPage />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
