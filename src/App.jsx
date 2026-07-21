import "./App.css";
import { useEffect, useState } from "react";
import LinkShortenerSection from "./components/LinkShortenerSection/LinkShortenerSection";
import RedirectPage from "./components/Redirect/RedirectPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageNotFound from "./components/404/PageNotFound";
import TooManyRequests from "./components/429/TooManyRequests";
import Footer from "./components/Footer/Footer";
import LogoContainer from "./components/LogoContainer/LogoContainer";
import SmokeyCursor from "@/components/lightswind/smokey-cursor";
import { useIsMobile } from "./hooks/use-mobile";

const SMOKEY_CURSOR_DEFAULT_SETTINGS = {
  simulationResolution: 256,
  dyeResolution: 2048,
  densityDissipation: 2,
  velocityDissipation: 2,
  curl: 5,
  splatForce: 8000,
  enableShading: true,
};

const SMOKEY_CURSOR_REDUCED_SETTINGS = {
  simulationResolution: 64,
  dyeResolution: 512,
  densityDissipation: 5,
  velocityDissipation: 3,
  curl: 3,
  splatForce: 4500,
  enableShading: false,
};

function useSmokeyCursorPerformance(isMobile) {
  const [settings, setSettings] = useState({
    ...SMOKEY_CURSOR_REDUCED_SETTINGS,
    disabled: true,
  });

  useEffect(() => {
    if (isMobile || typeof window === "undefined") {
      setSettings({
        ...SMOKEY_CURSOR_REDUCED_SETTINGS,
        disabled: true,
      });
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const connection = navigator.connection;
    const isSavingData = Boolean(connection?.saveData);
    const memory = navigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    const webgl = getWebGLPerformanceInfo();

    const shouldDisable =
      prefersReducedMotion ||
      hasCoarsePointer ||
      isSavingData ||
      !webgl.supported ||
      webgl.usesSoftwareRenderer ||
      memory <= 2 ||
      cores <= 2;

    if (shouldDisable) {
      setSettings({
        ...SMOKEY_CURSOR_REDUCED_SETTINGS,
        disabled: true,
      });
      return;
    }

    const shouldReduce = memory <= 4 || cores <= 4 || webgl.isLimitedRenderer;

    setSettings({
      ...(shouldReduce
        ? SMOKEY_CURSOR_REDUCED_SETTINGS
        : SMOKEY_CURSOR_DEFAULT_SETTINGS),
      disabled: false,
    });
  }, [isMobile]);

  return settings;
}

function getWebGLPerformanceInfo() {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl");

  if (!gl) {
    return {
      supported: false,
      usesSoftwareRenderer: false,
      isLimitedRenderer: false,
    };
  }

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : "";
  const rendererName = String(renderer).toLowerCase();
  const usesSoftwareRenderer =
    rendererName.includes("swiftshader") ||
    rendererName.includes("llvmpipe") ||
    rendererName.includes("software") ||
    rendererName.includes("basic render");

  return {
    supported: true,
    usesSoftwareRenderer,
    isLimitedRenderer: rendererName.includes("intel"),
  };
}

function App() {
  const isMobile = useIsMobile();
  const smokeyCursorSettings = useSmokeyCursorPerformance(isMobile);

  return (
    <Router>
      <main className="app-shell flex w-screen flex-col items-center justify-center">
        <SmokeyCursor
          {...smokeyCursorSettings}
          autoColors={false}
          color="#3b82f6"
          zIndex={0}
          enableClick={false}
        />
        <div className="app-content flex w-full flex-col items-center justify-center">
          <LogoContainer />
          <Routes>
            <Route path="/" element={<LinkShortenerSection />} />
            {import.meta.env.DEV && (
              <Route path="/:slug" element={<RedirectPage />} />
            )}
            <Route path="/404" element={<PageNotFound />} />
            <Route path="/429" element={<TooManyRequests />} />
          </Routes>

          <Footer />
        </div>
      </main>
    </Router>
  );
}

export default App;
