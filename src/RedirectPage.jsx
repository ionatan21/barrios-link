import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RedirectPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await fetch(`https://barrios-link-backend.vercel.app/api/${slug}`);
        if (!response.ok) throw new Error("URL not found");

        const data = await response.json();
        window.location.href = data.url_original; // Redirección

      } catch (error) {
        console.error("Error fetching URL:", error);
        navigate("/404"); // Redirigir a una página de error si falla
      }
    };

    fetchUrl();
  }, [slug, navigate]);

  return <p>Redirecting...</p>;
};

export default RedirectPage;
