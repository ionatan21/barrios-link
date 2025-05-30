import "./App.css";
import ShortenUrl from "./components/Shortenurl/ShortenUrl";
import RedirectPage from "./components/Redirect/RedirectPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageNotFound from "./components/404/PageNotFound";
import Footer from "./components/Footer/Footer";
import Gradient from "./components/Background/Gradient";
import LogoContainer from "./components/LogoContainer/LogoContainer";

function App() {
  return (
    <Router>
      <main className="flex mt-20 md:mt-0  w-screen flex-col items-center justify-center">
        <LogoContainer />
        <Gradient />
        <Routes>
          <Route path="/" element={<ShortenUrl />} />
          <Route path="/:slug" element={<RedirectPage />} />
          <Route path="/404" element={<PageNotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
