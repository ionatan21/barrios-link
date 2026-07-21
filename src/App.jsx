import "./App.css";
import LinkShortenerSection from "./components/LinkShortenerSection/LinkShortenerSection";
import RedirectPage from "./components/Redirect/RedirectPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageNotFound from "./components/404/PageNotFound";
import TooManyRequests from "./components/429/TooManyRequests";
import Footer from "./components/Footer/Footer";
import LogoContainer from "./components/LogoContainer/LogoContainer";
import SmokeyCursor from "@/components/lightswind/smokey-cursor";
import { useIsMobile } from "./hooks/use-mobile";

function App() {
  const isMobile = useIsMobile();

  return (
    <Router>
      <main className="app-shell flex w-screen flex-col items-center justify-center">
        <SmokeyCursor
          simulationResolution={256}
          dyeResolution={2048}
          densityDissipation={2}
          curl={5}
          splatForce={8000}
          enableShading={true}
          autoColors={false}
          color="#3b82f6"
          zIndex={0}
          enableClick={false}
          disabled={isMobile}
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
