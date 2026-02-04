import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS } from "@/config/api";
import "./ShortenUrl.css"; // Import your CSS file for styles

const ShortenUrl = () => {
  const [urlState, setUrlState] = useState({
    original: "",
    short: "",
    shortAlt: ""
  });
  
  const [requestState, setRequestState] = useState({
    isLoading: false,
    error: ""
  });
  
  const [uiState, setUiState] = useState({
    isHover: false,
    isInputFocused: false
  });
  
  const [links, setLinks] = useState([]);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef(null);
  const shineRef = useRef(null);
  const shadowRef = useRef(null);

  // Validar si la URL es válida
  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      // Si no tiene protocolo, agregar https://
      const urlToValidate = url.match(/^https?:\/\//) ? url : `https://${url}`;
      new URL(urlToValidate);
      return true;
    } catch {
      return false;
    }
  };

  // Normalizar URL agregando protocolo si no lo tiene
  const normalizeUrl = (url) => {
    return url.match(/^https?:\/\//) ? url : `https://${url}`;
  };

  const isButtonDisabled = !isValidUrl(urlState.original) || requestState.isLoading;

  // Cargar enlaces guardados en localStorage al inicio
  useEffect(() => {
    const storedLinks =
      JSON.parse(localStorage.getItem("shortenedLinks")) || [];
    setLinks(storedLinks);
  }, []);

  // Efecto 3D que sigue al cursor cuando NO está en hover
  useEffect(() => {
    if (uiState.isHover || uiState.isInputFocused) return; // Cancela la animación en hover o cuando se escribe

    const onMouseMove = (e) => {
      const wWidth = window.innerWidth;
      const wHeight = window.innerHeight;

      const x = e.pageX;
      const y = e.pageY;

      const mouseFromCenterX = x - wWidth / 2;
      const mouseFromCenterY = y - wHeight / 2;

      const around1 = -1 * (y * 100 / wHeight * 0.15 - 7.5); // deg
      const around2 =  1 * (x * 100 / wWidth  * 0.15 - 7.5); // deg

      const trans1 = (mouseFromCenterX / wWidth) * 20; // px centrado
      const trans2 = (mouseFromCenterY / wHeight) * 20; // px centrado

      const dy = y - wHeight / 2;
      const dx = x - wWidth / 2;
      const theta = Math.atan2(dy, dx);
      const angle = (theta * 180) / Math.PI - 90;

      if (shineRef.current) {
        shineRef.current.style.background =
          `linear-gradient(${angle}deg, rgba(255,255,255,${(y / wHeight) * 0.5}) 0%, rgba(255,255,255,0) 80%)`;
      }

      if (cardRef.current) {
        cardRef.current.style.transform =
          `translate3d(${trans1}px, ${trans2}px, 0) scale(1) rotateX(${around1}deg) rotateY(${around2}deg)`;
      }

      if (shadowRef.current) {
        shadowRef.current.style.transform =
          `scale(0.95, 0.95) translateX(${(mouseFromCenterX * -0.02) + 8}px) translateY(${(mouseFromCenterY * -0.02) + 8}px) rotateY(${(mouseFromCenterX / 25) * 0.5}deg) rotateX(${(mouseFromCenterY / -25)}deg)`;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [uiState.isHover, uiState.isInputFocused]);

  // Efecto 3D usando giroscopio en móviles
  useEffect(() => {
    if (uiState.isHover || uiState.isInputFocused) return;

    // Detectar si es un dispositivo móvil con giroscopio
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const handleOrientation = (event) => {
      const { beta, gamma } = event; // beta: inclinación adelante/atrás, gamma: izquierda/derecha

      // Normalizar los valores (-180 a 180 para beta, -90 a 90 para gamma)
      const normalizedBeta = Math.max(-45, Math.min(45, beta || 0)); // Limitar rango
      const normalizedGamma = Math.max(-45, Math.min(45, gamma || 0));

      const around1 = normalizedBeta * 0.3; // Rotación X
      const around2 = normalizedGamma * 0.3; // Rotación Y

      const trans1 = normalizedGamma * 0.4; // Translación X
      const trans2 = normalizedBeta * 0.4; // Translación Y

      // Calcular ángulo para el brillo
      const angle = Math.atan2(normalizedBeta, normalizedGamma) * (180 / Math.PI);

      if (shineRef.current) {
        shineRef.current.style.background =
          `linear-gradient(${angle}deg, rgba(255,255,255,${Math.abs(normalizedBeta) / 100 + 0.2}) 0%, rgba(255,255,255,0) 80%)`;
      }

      if (cardRef.current) {
        cardRef.current.style.transform =
          `translate3d(${trans1}px, ${trans2}px, 0) scale(1) rotateX(${around1}deg) rotateY(${around2}deg)`;
      }

      if (shadowRef.current) {
        shadowRef.current.style.transform =
          `scale(0.95, 0.95) translateX(${normalizedGamma * -0.2}px) translateY(${normalizedBeta * -0.2}px) rotateY(${normalizedGamma * 0.2}deg) rotateX(${normalizedBeta * -0.2}deg)`;
      }
    };

    // Pedir permiso en iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [uiState.isHover, uiState.isInputFocused]);

  const handleShorten = async () => {
    if (!urlState.original) {
      setRequestState(prev => ({ ...prev, error: "Por favor, ingresa una URL válida." }));
      return;
    }

    const urlToShorten = normalizeUrl(urlState.original);
    setRequestState({ isLoading: true, error: "" });

    try {
      const response = await fetch(
        API_ENDPOINTS.createUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToShorten }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        // Manejar errores específicos del servidor
        if (response.status === 429) {
          setRequestState(prev => ({ ...prev, error: data.error || "Límite alcanzado. Inténtalo mañana." }));
        } else if (response.status === 400) {
          setRequestState(prev => ({ ...prev, error: data.error || "URL inválida. Por favor verifica la URL." }));
        } else {
          setRequestState(prev => ({ ...prev, error: data.error || "Error al acortar la URL. Inténtalo de nuevo." }));
        }
        setRequestState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      if (data.slug) {
        const newShortUrl = `https://barrios-link.vercel.app//${data.slug}`;
        const linkalt = `barrios-link.vercel.app/${data.slug}`;

        // Agregar nuevo link a la lista
        const newLinks = [
          { originalUrl: urlToShorten, linkalt: linkalt, shortUrl: newShortUrl },
          ...links,
        ];
        setLinks(newLinks);
        localStorage.setItem("shortenedLinks", JSON.stringify(newLinks));

        setUrlState({
          original: urlState.original,
          short: newShortUrl,
          shortAlt: linkalt
        });
        setRequestState({ isLoading: false, error: "" });
      } else {
        setRequestState({ isLoading: false, error: "Error al acortar la URL. Inténtalo de nuevo." });
      }
    } catch (error) {
      console.error("Error:", error);
      setRequestState({ isLoading: false, error: "Hubo un problema al conectar con el servidor. Verifica tu conexión." });
    }
  };

  const handleDelete = (indexToRemove) => {
    const updatedLinks = links.filter((_, index) => index !== indexToRemove);
    setLinks(updatedLinks);
    localStorage.setItem("shortenedLinks", JSON.stringify(updatedLinks));
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

  // Cancelar animación y resetear estilos al entrar en hover
  const cancelAndReset = () => {
    setUiState(prev => ({ ...prev, isHover: true }));

    if (shineRef.current) {
      shineRef.current.style.background =
        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)";
    }
    if (cardRef.current) {
      cardRef.current.style.transform = "none";
    }
    if (shadowRef.current) shadowRef.current.style.transform = "none";
  };

  const resume = () => setUiState(prev => ({ ...prev, isHover: false }));

  return (
    <div className="card-wrapper-3d w-full max-w-[90vw] md:max-w-max">
      <div className="card-shadow-3d" ref={shadowRef} />
      <div 
        ref={cardRef}
        className="w-full z-10 max-w-[90vw] md:max-w-max flex flex-col items-center bg-white shadow-lg rounded-xl mb-4 p-10 card-3d-container"
        onMouseEnter={cancelAndReset}
        onMouseLeave={resume}
      >
        <div className="card-shine-3d" ref={shineRef} />
        <h1 className="text-2xl md:text-5xl font-semibold mb-6">
          Shorten Your Link
        </h1>
      <Input
        className="w-full p-2 border border-gray-300 focus:outline-orange-800 rounded-lg"
        type="text"
        placeholder="Paste your link here..."
        value={urlState.original}
        onInput={(e) => setUrlState(prev => ({ ...prev, original: e.target.value }))}
        onMouseEnter={cancelAndReset}
        onFocus={() => setUiState(prev => ({ ...prev, isInputFocused: true }))}
        onBlur={() => setUiState(prev => ({ ...prev, isInputFocused: false }))}
      />

      {requestState.error && (
        <div className="w-full mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {requestState.error}
        </div>
      )}

      <Button
        onClick={handleShorten}
        disabled={isButtonDisabled}
        onMouseEnter={cancelAndReset}
        className="w-32 mt-3 z-100 select-none text-white bg-black opacity-75 hover:opacity-100 hover:scale-105 font-medium py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {requestState.isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          "Shorten!"
        )}
      </Button>

      {urlState.short && (
        <div className="mt-4 w-full flex flex-col items-center gap-2">
          <p className="text-center">
            <strong>Short Link:</strong>{" "}
            <a
              href={urlState.short}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {urlState.shortAlt}
            </a>
          </p>
          <Button
            onClick={copyToClipboard}
            onMouseEnter={cancelAndReset}
            className="w-auto px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </>
            )} 
          </Button>
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-6 w-full ">
          <h2 className="text-lg text-center font-semibold mb-2">Your Links</h2>
          <ul className="w-full max-h-40 overflow-y-auto">
            {links.map((link, index) => (
              <li
                key={index}
                className="flex  flex-col items-center md:flex-row gap-4 justify-between mb-2 p-2 border-b border-gray-200"
              >
                <span
                  className="text-sm max-w-44 text-gray-600 truncate"
                  title={link.originalUrl}
                >
                  {link.originalUrl}
                </span>

                <div className="flex flex-row  justify-between gap-2">
                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm underline"
                  >
                    {link.linkalt}
                  </a>

                  <button
                    className="delete"
                    onClick={() => handleDelete(index)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  );
};

export default ShortenUrl;
