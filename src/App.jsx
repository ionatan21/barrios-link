import "./App.css";
import LinkShortenerSection from "./components/LinkShortenerSection/LinkShortenerSection";
import RedirectPage from "./components/Redirect/RedirectPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageNotFound from "./components/404/PageNotFound";
import Footer from "./components/Footer/Footer";
import Gradient from "./components/Background/Gradient";
import LogoContainer from "./components/LogoContainer/LogoContainer";
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import { useState, useEffect } from 'react';

function App() {
  const [shouldRenderShader, setShouldRenderShader] = useState(true);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // Detectar dispositivos móviles o de bajos recursos
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    const hasLowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    // Desactivar shader en móviles para mejor rendimiento
    if (isMobile) {
      setShouldRenderShader(false);
    }
    
    // Usar configuración de bajo rendimiento si es necesario
    if (hasLowMemory || hasLowCores) {
      setIsLowPerformance(true);
    }
  }, []);

  return (
    <Router>
      <main className="flex mt-30 md:mt-10  w-screen flex-col items-center justify-center">
        <LogoContainer />
        <Gradient />
        {shouldRenderShader && (
          <ShaderGradientCanvas
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', touchAction: 'none' }}
            pixelDensity={isLowPerformance ? 0.8 : 1}
            fov={45}
            pointerEvents="none"
          >
            <ShaderGradient
              animate="on"
              brightness={1.1}
              cAzimuthAngle={0}
              cDistance={7.1}
              cPolarAngle={140}
              cameraZoom={17.3}
              color1="#ffffff"
              color2="#ff8c00"
              color3="#009dff"
              embedMode="off"
              envPreset="city"
              frameRate={isLowPerformance ? 5 : 10}
              grain="off"
              lightType="3d"
              reflection={0.1}
              shader="defaults"
              type="sphere"
              uAmplitude={1.4}
              uDensity={1.1}
              uFrequency={5.5}
              uSpeed={0.1}
              uStrength={1}
              wireframe={false}
            />
          </ShaderGradientCanvas>
        )}

        <Routes>
          <Route path="/" element={<LinkShortenerSection />} />
          <Route path="/:slug" element={<RedirectPage />} />
          <Route path="/404" element={<PageNotFound />} />
        </Routes>

        <Footer />
      </main>

    </Router>
  );
}

export default App;
