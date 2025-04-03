import "./App.css";
import ShortenUrl from "./components/ShortenUrl";
import RedirectPage from "./RedirectPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ShortenUrl />} />
        <Route path="/:slug" element={<RedirectPage />} />
        <Route path="/404" element={<h1 className="w-screen text-red-500 inset-0 text-center">Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
