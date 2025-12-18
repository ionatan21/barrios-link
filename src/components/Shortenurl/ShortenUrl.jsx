import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS } from "@/config/api";
import "./ShortenUrl.css"; // Import your CSS file for styles

const ShortenUrl = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortalt, setshortalt] = useState("");
  const [links, setLinks] = useState([]);
  const [isHover, setIsHover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const isButtonDisabled = !isValidUrl(originalUrl) || isLoading;

  // Cargar enlaces guardados en localStorage al inicio
  useEffect(() => {
    const storedLinks =
      JSON.parse(localStorage.getItem("shortenedLinks")) || [];
    setLinks(storedLinks);
  }, []);

  // Efecto 3D que sigue al cursor cuando NO está en hover
  useEffect(() => {
    if (isHover) return; // Cancela la animación en hover

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
  }, [isHover]);

  const handleShorten = async () => {
    if (!originalUrl) return alert("Por favor, ingresa una URL válida.");

    const urlToShorten = normalizeUrl(originalUrl);
    setIsLoading(true);

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

        setShortUrl(newShortUrl);
        setshortalt(linkalt);
      } else {
        alert("Error al acortar la URL");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (indexToRemove) => {
    const updatedLinks = links.filter((_, index) => index !== indexToRemove);
    setLinks(updatedLinks);
    localStorage.setItem("shortenedLinks", JSON.stringify(updatedLinks));
  };

  // Cancelar animación y resetear estilos al entrar en hover
  const cancelAndReset = () => {
    setIsHover(true);

    if (shineRef.current) {
      shineRef.current.style.background =
        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)";
    }
    if (cardRef.current) {
      cardRef.current.style.transform = "none";
    }
    if (shadowRef.current) shadowRef.current.style.transform = "none";
  };

  const resume = () => setIsHover(false);

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
        value={originalUrl}
        onInput={(e) => setOriginalUrl(e.target.value)}
        onMouseEnter={cancelAndReset}
      />
      <Button
        onClick={handleShorten}
        disabled={isButtonDisabled}
        onMouseEnter={cancelAndReset}
        className="w-32 mt-3 z-100 select-none text-white bg-black opacity-75 hover:opacity-100 hover:scale-105 font-medium py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {isLoading ? (
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

      {shortUrl && (
        <p className="mt-4 text-center">
          <strong>Short Link:</strong>{" "}
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {shortalt}
          </a>
        </p>
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
