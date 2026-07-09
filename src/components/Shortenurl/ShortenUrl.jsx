import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  LoaderCircle,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS, APP_URL } from "@/config/api";
import "./ShortenUrl.css";

const STORAGE_KEY = "shortenedLinks";

const getStoredLinks = () => {
  try {
    const storedLinks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(storedLinks) ? storedLinks : [];
  } catch {
    return [];
  }
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

const ShortenUrl = ({ onLinkCreated }) => {
  const [urlState, setUrlState] = useState({
    original: "",
    short: "",
    shortAlt: "",
    createdAt: "",
  });

  const [requestState, setRequestState] = useState({
    isLoading: false,
    error: "",
  });

  const [uiState, setUiState] = useState({
    isHover: false,
    isInputFocused: false,
  });

  const [links, setLinks] = useState([]);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("shorten");
  const [search, setSearch] = useState("");

  const cardRef = useRef(null);
  const shineRef = useRef(null);
  const shadowRef = useRef(null);

  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      const urlToValidate = url.match(/^https?:\/\//) ? url : `https://${url}`;
      new URL(urlToValidate);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeUrl = (url) => {
    return url.match(/^https?:\/\//) ? url : `https://${url}`;
  };

  const isButtonDisabled =
    !isValidUrl(urlState.original) || requestState.isLoading;

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return links;

    return links.filter((link) => {
      const original = link.originalUrl?.toLowerCase() || "";
      const short = (link.linkalt || link.shortUrl || "").toLowerCase();
      return original.includes(query) || short.includes(query);
    });
  }, [links, search]);

  useEffect(() => {
    setLinks(getStoredLinks());
  }, []);

  useEffect(() => {
    if (uiState.isHover || uiState.isInputFocused) return;

    const onMouseMove = (e) => {
      const wWidth = window.innerWidth;
      const wHeight = window.innerHeight;
      const x = e.pageX;
      const y = e.pageY;
      const mouseFromCenterX = x - wWidth / 2;
      const mouseFromCenterY = y - wHeight / 2;
      const around1 = -1 * (((y * 100) / wHeight) * 0.08 - 4);
      const around2 = 1 * (((x * 100) / wWidth) * 0.08 - 4);
      const trans1 = (mouseFromCenterX / wWidth) * 10;
      const trans2 = (mouseFromCenterY / wHeight) * 10;
      const theta = Math.atan2(y - wHeight / 2, x - wWidth / 2);
      const angle = (theta * 180) / Math.PI - 90;

      if (shineRef.current) {
        shineRef.current.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,${(y / wHeight) * 0.22}) 0%, rgba(255,255,255,0) 72%)`;
      }

      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${trans1}px, ${trans2}px, 0) rotateX(${around1}deg) rotateY(${around2}deg)`;
      }

      if (shadowRef.current) {
        shadowRef.current.style.transform = `translateX(${mouseFromCenterX * -0.01}px) translateY(${mouseFromCenterY * -0.01}px)`;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [uiState.isHover, uiState.isInputFocused]);

  const persistLinks = (updatedLinks) => {
    setLinks(updatedLinks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLinks));
  };

  const handleShorten = async () => {
    if (!urlState.original) {
      setRequestState({
        isLoading: false,
        error: "Ingresa una URL valida.",
      });
      return;
    }

    const urlToShorten = normalizeUrl(urlState.original);
    setRequestState({ isLoading: true, error: "" });

    try {
      const response = await fetch(API_ENDPOINTS.createUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToShorten }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRequestState({
          isLoading: false,
          error: data.error || "No se pudo acortar la URL.",
        });
        return;
      }

      if (data.slug) {
        const newShortUrl = `${APP_URL}/${data.slug}`;
        const linkalt = `${APP_URL.replace(/^https?:\/\//, "")}/${data.slug}`;
        const createdAt = new Date().toISOString();
        const newLinks = [
          {
            originalUrl: urlToShorten,
            linkalt,
            shortUrl: newShortUrl,
            createdAt,
          },
          ...links,
        ];

        persistLinks(newLinks);
        onLinkCreated?.();
        setUrlState({
          original: urlToShorten,
          short: newShortUrl,
          shortAlt: linkalt,
          createdAt,
        });
        setRequestState({ isLoading: false, error: "" });
      } else {
        setRequestState({
          isLoading: false,
          error: "No se pudo acortar la URL.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setRequestState({
        isLoading: false,
        error: "Hubo un problema al conectar con el servidor.",
      });
    }
  };

  const handleDelete = (indexToRemove) => {
    const linkToRemove = filteredLinks[indexToRemove];
    const updatedLinks = links.filter((link) => link !== linkToRemove);
    persistLinks(updatedLinks);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(urlState.short);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const cancelAndReset = () => {
    setUiState((prev) => ({ ...prev, isHover: true }));

    if (shineRef.current) {
      shineRef.current.style.background =
        "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 58%)";
    }
    if (cardRef.current) {
      cardRef.current.style.transform = "none";
    }
    if (shadowRef.current) shadowRef.current.style.transform = "none";
  };

  const resume = () => setUiState((prev) => ({ ...prev, isHover: false }));

  const showResult = Boolean(urlState.short);
  const isAdmin = mode === "admin";
  const cardState = isAdmin ? "admin" : showResult ? "result" : "idle";

  return (
    <div className="card-wrapper-3d">
      <div className="card-shadow-3d" ref={shadowRef} />
      <section
        ref={cardRef}
        className={`shortener-card shortener-card--${cardState}`}
        onMouseEnter={cancelAndReset}
        onMouseLeave={resume}
      >
        <div className="card-shine-3d" ref={shineRef} />

        <div className="shortener-tabs" aria-label="Vista">
          <button
            type="button"
            className={mode === "shorten" ? "is-active" : ""}
            onClick={() => setMode("shorten")}
          >
            <Link2 size={18} />
            Acortar
          </button>
          <button
            type="button"
            className={mode === "admin" ? "is-active" : ""}
            onClick={() => setMode("admin")}
          >
            <Settings2 size={18} />
            Administrar
          </button>
        </div>

        {!isAdmin ? (
          <div className="shortener-panel">
            <div className="shortener-form">
              <Input
                className="shortener-input"
                type="text"
                placeholder="Pega tu URL aqui"
                value={urlState.original}
                onInput={(e) =>
                  setUrlState((prev) => ({
                    ...prev,
                    original: e.target.value,
                  }))
                }
                onFocus={() =>
                  setUiState((prev) => ({ ...prev, isInputFocused: true }))
                }
                onBlur={() =>
                  setUiState((prev) => ({ ...prev, isInputFocused: false }))
                }
              />

              <Button
                onClick={handleShorten}
                disabled={isButtonDisabled}
                className="shortener-button"
              >
                {requestState.isLoading ? (
                  <>
                    <LoaderCircle className="spin" size={18} />
                    Acortando
                  </>
                ) : (
                  "Acortar"
                )}
              </Button>
            </div>

            {requestState.error && (
              <div className="shortener-error">{requestState.error}</div>
            )}

            {showResult && (
              <div className="shortener-result">
                <div>
                  <span>URL original</span>
                  <p title={urlState.original}>{urlState.original}</p>
                </div>

                <div>
                  <span>URL acortada</span>
                  <a
                    href={urlState.short}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {urlState.shortAlt}
                    <ExternalLink size={16} />
                  </a>
                </div>

                <div className="result-actions">
                  <Button onClick={copyToClipboard} className="copy-button">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <span>
                    {urlState.createdAt
                      ? formatDate(new Date(urlState.createdAt))
                      : "Guardado localmente"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="admin-panel">
            <label className="admin-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <div className="admin-list" aria-live="polite">
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link, index) => (
                  <article className="admin-link" key={`${link.shortUrl}-${index}`}>
                    <div>
                      <p title={link.originalUrl}>{link.originalUrl}</p>
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.linkalt || link.shortUrl}
                      </a>
                    </div>
                    <button
                      type="button"
                      className="delete-link"
                      onClick={() => handleDelete(index)}
                      aria-label="Borrar enlace local"
                      title="Borrar enlace local"
                    >
                      <Trash2 size={18} />
                    </button>
                  </article>
                ))
              ) : (
                <div className="admin-empty">
                  {links.length ? "No hay coincidencias." : "Aun no tienes enlaces guardados."}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ShortenUrl;
