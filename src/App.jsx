import "./App.css";
import ShortenUrl from "./components/Shortenurl/ShortenUrl";
import RedirectPage from "./components/Redirect/RedirectPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageNotFound from "./components/404/PageNotFound";
import Footer from "./components/Footer/Footer";
import Gradient from "./components/Background/Gradient";
import LogoContainer from "./components/LogoContainer/LogoContainer";
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

function App() {
  return (
    <Router>
      <main className="flex mt-30 md:mt-10  w-screen flex-col items-center justify-center">
        <LogoContainer />
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', touchAction: 'none' }}
          pixelDensity={1.5}
          fov={45}
          pointerEvents="none"
        >
          <ShaderGradient
            animate="on"
            axesHelper="on"
            brightness={1.1}
            cAzimuthAngle={0}
            cDistance={7.1}
            cPolarAngle={140}
            cameraZoom={17.3}
            color1="#ffffff"
            color2="#ff8c00"
            color3="#009dff"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="off"
            lightType="3d"
            pixelDensity={1}
            positionX={0}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={0}
            rotationY={0}
            rotationZ={0}
            shader="defaults"
            type="sphere"
            uAmplitude={1.4}
            uDensity={1.1}
            uFrequency={5.5}
            uSpeed={0.1}
            uStrength={1}
            uTime={0}
            wireframe={false}
          />

        </ShaderGradientCanvas>

        <Routes>
          <Route path="/" element={<ShortenUrl />} />
          <Route path="/:slug" element={<RedirectPage />} />
          <Route path="/404" element={<PageNotFound />} />
        </Routes>

        <Footer />
      </main>

    </Router>
  );
}

export default App;
