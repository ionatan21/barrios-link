import { useEffect, useMemo, useState } from "react";
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
import GlassElement from "@/components/GlassElement";
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

  const [links, setLinks] = useState([]);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("shorten");
  const [search, setSearch] = useState("");
  const [previewState, setPreviewState] = useState({
    isLoading: false,
    data: null,
  });
  const [adminPreviews, setAdminPreviews] = useState({});
  const [copiedAdminLink, setCopiedAdminLink] = useState("");
  const isAdmin = mode === "admin";

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

  const showResult = Boolean(urlState.short);
  const isButtonDisabled =
    (!showResult && !isValidUrl(urlState.original)) || requestState.isLoading;

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return links;

    return links.filter((link) => {
      const original = link.originalUrl?.toLowerCase() || "";
      const short = (link.linkalt || link.shortUrl || "").toLowerCase();
      const preview = adminPreviews[link.originalUrl]?.data;
      const title = preview?.title?.toLowerCase() || "";
      const siteName = preview?.siteName?.toLowerCase() || "";
      return (
        original.includes(query) ||
        short.includes(query) ||
        title.includes(query) ||
        siteName.includes(query)
      );
    });
  }, [adminPreviews, links, search]);

  useEffect(() => {
    setLinks(getStoredLinks());
  }, []);

  const persistLinks = (updatedLinks) => {
    setLinks(updatedLinks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLinks));
  };

  const getMetadata = async (url) => {
    const response = await fetch(API_ENDPOINTS.getMetadata(url));
    const data = await response.json();
    return data.found ? data : null;
  };

  const fetchPreview = async (url) => {
    setPreviewState({ isLoading: true, data: null });

    try {
      const data = await getMetadata(url);
      setPreviewState({ isLoading: false, data });
    } catch (error) {
      console.error("Error al obtener metadata:", error);
      setPreviewState({ isLoading: false, data: null });
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    const linksToFetch = filteredLinks
      .slice(0, 12)
      .filter(
        (link) =>
          link.originalUrl &&
          isValidUrl(link.originalUrl) &&
          !adminPreviews[link.originalUrl]
      );

    if (!linksToFetch.length) return;

    linksToFetch.forEach((link) => {
      setAdminPreviews((prev) => ({
        ...prev,
        [link.originalUrl]: { isLoading: true, data: null },
      }));

      getMetadata(link.originalUrl)
        .then((data) => {
          setAdminPreviews((prev) => ({
            ...prev,
            [link.originalUrl]: { isLoading: false, data },
          }));
        })
        .catch(() => {
          setAdminPreviews((prev) => ({
            ...prev,
            [link.originalUrl]: { isLoading: false, data: null },
          }));
        });
    });
  }, [adminPreviews, filteredLinks, isAdmin]);

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
    setCopied(false);
    setUrlState({
      original: urlToShorten,
      short: "",
      shortAlt: "",
      createdAt: "",
    });
    fetchPreview(urlToShorten);

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

  const handleResetShortener = () => {
    setUrlState({
      original: "",
      short: "",
      shortAlt: "",
      createdAt: "",
    });
    setPreviewState({ isLoading: false, data: null });
    setRequestState({ isLoading: false, error: "" });
    setCopied(false);
  };

  const handlePrimaryAction = () => {
    if (showResult) {
      handleResetShortener();
      return;
    }

    handleShorten();
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

  const copyAdminLink = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedAdminLink(shortUrl);
      setTimeout(() => setCopiedAdminLink(""), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const cardState = isAdmin ? "admin" : showResult ? "result" : "idle";

  return (
    <div className="card-wrapper-3d">
      <GlassElement
        as="section"
        className={`shortener-card shortener-card--${cardState}`}
        width="min(560px, calc(100vw - 32px))"
        height="auto"
        radius="var(--radius-lg)"
        style={{
          "--glass-element-filter": 'url("/liquid-glass-displace-panel.svg#displace")',
        }}
      >
        <div
          className={`shortener-tabs shortener-tabs--${mode}`}
          aria-label="Vista"
          role="tablist"
        >
          <button
            type="button"
            className={mode === "shorten" ? "is-active" : ""}
            onClick={() => setMode("shorten")}
            role="tab"
            aria-selected={mode === "shorten"}
          >
            <Link2 size={18} />
            Acortar
          </button>
          <button
            type="button"
            className={mode === "admin" ? "is-active" : ""}
            onClick={() => setMode("admin")}
            role="tab"
            aria-selected={mode === "admin"}
          >
            <Settings2 size={18} />
            Administrar
          </button>
        </div>

        {!isAdmin ? (
          <div className="shortener-panel">
            <div className="shortener-form">
              <Input
                className="shortener-input text-white"
                type="text"
                placeholder="Pega tu URL aqui"
                value={urlState.original}
                onInput={(e) => {
                  const nextValue = e.target.value;
                  setUrlState((prev) => ({
                    ...prev,
                    original: nextValue,
                    short: nextValue === prev.original ? prev.short : "",
                    shortAlt: nextValue === prev.original ? prev.shortAlt : "",
                    createdAt: nextValue === prev.original ? prev.createdAt : "",
                  }));

                  if (showResult && nextValue !== urlState.original) {
                    setPreviewState({ isLoading: false, data: null });
                    setRequestState({ isLoading: false, error: "" });
                    setCopied(false);
                  }
                }}
              />

              <Button
                onClick={handlePrimaryAction}
                disabled={isButtonDisabled}
                className="shortener-button cursor-pointer"
              >
                {requestState.isLoading ? (
                  <>
                    <LoaderCircle className="spin" size={18} />
                    Acortando
                  </>
                ) : showResult ? (
                  "Limpiar"
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
                <div className="original-preview-card">
                  <span className="">URL original</span>
                  {previewState.isLoading ? (
                    <div className="preview-loading">
                      <LoaderCircle className="spin" size={18} />
                      Cargando vista previa
                    </div>
                  ) : previewState.data ? (
                    <div className="link-preview">
                      {previewState.data.image && (
                        <img
                          src={previewState.data.image}
                          alt=""
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <strong>{previewState.data.title}</strong>
                        {previewState.data.description && (
                          <p>{previewState.data.description}</p>
                        )}
                        <small>{previewState.data.siteName || urlState.original}</small>
                      </div>
                    </div>
                  ) : (
                    <p title={urlState.original}>{urlState.original}</p>
                  )}
                </div>

                <div className="short-link-card">
                  <div className="short-link-header">
                    <span>URL acortada</span>
                    <time>
                      {urlState.createdAt
                        ? formatDate(new Date(urlState.createdAt))
                        : "Guardado localmente"}
                    </time>
                  </div>
                  <div className="short-link-row">
                    <a
                      href={urlState.short}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {urlState.shortAlt}
                      <ExternalLink size={16} />
                    </a>
                    <Button onClick={copyToClipboard} className="copy-button">
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="admin-panel">
            <label className="admin-search">
              <Search size={18} color="#ffffff" />
              <input
                type="search"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <div className="admin-list" aria-live="polite">
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link, index) => {
                  const preview = adminPreviews[link.originalUrl];

                  return (
                    <article className="admin-link" key={`${link.shortUrl}-${index}`}>
                      <div className="admin-link-content">
                        {preview?.data?.image && (
                          <img
                            src={preview.data.image}
                            alt=""
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div>
                          {preview?.isLoading ? (
                            <p className="admin-preview-loading">
                              Cargando vista previa
                            </p>
                          ) : preview?.data ? (
                            <>
                              <p title={preview.data.title}>
                                {preview.data.title}
                              </p>
                              {preview.data.siteName && (
                                <small>{preview.data.siteName}</small>
                              )}
                            </>
                          ) : (
                            <p title={link.originalUrl}>{link.originalUrl}</p>
                          )}
                          <div className="admin-short-row">
                            <a
                              href={link.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.linkalt || link.shortUrl}
                            </a>
                            <ExternalLink size={14} />
                          </div>
                        </div>
                      </div>
                      <div className="admin-link-actions">
                        <button
                          type="button"
                          className="admin-icon-button admin-copy-link"
                          onClick={() => copyAdminLink(link.shortUrl)}
                          aria-label="Copiar enlace acortado"
                          title="Copiar enlace acortado"
                        >
                          {copiedAdminLink === link.shortUrl ? (
                            <Check size={18} color="#ffffff" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="admin-icon-button delete-link"
                          onClick={() => handleDelete(index)}
                          aria-label="Borrar enlace local"
                          title="Borrar enlace local"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="admin-empty">
                  {links.length ? "No hay coincidencias." : "Aun no tienes enlaces guardados."}
                </div>
              )}
            </div>
          </div>
        )}
      </GlassElement>
    </div>
  );
};

export default ShortenUrl;
