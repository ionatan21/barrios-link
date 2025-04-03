import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ShortenUrl = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortalt, setshortalt] = useState("");
  const [links, setLinks] = useState([]);

  // Cargar enlaces guardados en localStorage al inicio
  useEffect(() => {
    const storedLinks =
      JSON.parse(localStorage.getItem("shortenedLinks")) || [];
    setLinks(storedLinks);
  }, []);

  const handleShorten = async () => {
    if (!originalUrl) return alert("Por favor, ingresa una URL válida.");

    try {
      const response = await fetch(
        "https://barrios-link-backend.vercel.app/api/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: originalUrl }),
        }
      );

      const data = await response.json();
      if (data.slug) {
        const newShortUrl = `https://barrios-link.vercel.app//${data.slug}`;
        const linkalt = `barrios-link.vercel.app/${data.slug}`;

        // Agregar nuevo link a la lista
        const newLinks = [
          { originalUrl, linkalt: linkalt, shortUrl: newShortUrl },
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
    }
  };

  return (
    <div className="w-full max-w-max mx-auto flex flex-col items-center bg-white shadow-lg rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-4">Shorten Your Link</h1>
      <Input
        className="w-full p-2 border border-gray-300 rounded-lg"
        type="text"
        placeholder="Paste your link here..."
        value={originalUrl}
        onInput={(e) => setOriginalUrl(e.target.value)}
      />
      <Button
        onClick={handleShorten}
        className="w-32 mt-3 text-white font-medium py-2 rounded-lg"
      >
        Shorten!
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
        <div className="mt-6 w-full">
          <h2 className="text-lg text-center font-semibold mb-2">
            Previous Links
          </h2>
          <ul className="w-full">
            {links.map((link, index) => (
              <li
                key={index}
                className="flex flex-col md:flex-row justify-evenly mb-2 p-2 border-b border-gray-200"
              >
                <span
                  className="text-sm max-w-44 text-gray-600 truncate"
                  title={link.originalUrl}
                >
                  {link.originalUrl}
                </span>
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm underline"
                >
                  {link.linkalt}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShortenUrl;
