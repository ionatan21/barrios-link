import "./App.css";
import LinkShortenerSection from "./components/LinkShortenerSection/LinkShortenerSection";
import RedirectPage from "./components/Redirect/RedirectPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageNotFound from "./components/404/PageNotFound";
import TooManyRequests from "./components/429/TooManyRequests";
import Footer from "./components/Footer/Footer";
import LogoContainer from "./components/LogoContainer/LogoContainer";
import MouseTrailBackground from "./components/Background/MouseTrailBackground";

function App() {
  return (
    <Router>
      <main className="app-shell flex w-screen flex-col items-center justify-center">
        <MouseTrailBackground />
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
      </main>
    </Router>
  );
}

export default App;
