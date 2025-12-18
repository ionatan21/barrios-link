import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS } from "@/config/api";
import "./ShortenUrl.css"; // Import your CSS file for styles

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
        API_ENDPOINTS.createUrl,
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

  const handleDelete = (indexToRemove) => {
    const updatedLinks = links.filter((_, index) => index !== indexToRemove);
    setLinks(updatedLinks);
    localStorage.setItem("shortenedLinks", JSON.stringify(updatedLinks));
  };

  return (
    <div className="w-full animate-fade-in-down z-10 max-w-[90vw] md:max-w-max flex flex-col items-center bg-white shadow-lg rounded-xl mb-4 p-10">
      <h1 className="text-2xl md:text-5xl font-semibold mb-6">
        Shorten Your Link
      </h1>
      <Input
        className="w-full p-2 border border-gray-300 rounded-lg"
        type="text"
        placeholder="Paste your link here..."
        value={originalUrl}
        onInput={(e) => setOriginalUrl(e.target.value)}
      />
      <Button
        onClick={handleShorten}
        className="w-32 mt-3 text-white bg-black opacity-75 hover:opacity-100 font-medium py-2 rounded-lg cursor-pointer"
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
  );
};

export default ShortenUrl;
