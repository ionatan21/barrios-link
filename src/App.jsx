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
        <Route path="/404" element={<h1 className="text-red-500">Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
