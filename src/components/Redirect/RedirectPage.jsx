import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/config/api";

const RedirectPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

 useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getUrl(slug));

        if (response.status === 429) {
          navigate("/429");
          return;
        }

        if (!response.ok) throw new Error("URL not found");

        const data = await response.json();
        window.location.href = data.url_original;

      } catch (error) {
        console.error("Error fetching URL:", error);
        navigate("/404"); // Redirigir a una página de error si falla
      }
    };

    fetchUrl();
  }, [slug, navigate]);

  return <p className="w-screen animate-fade-in-down text-center z-10 text-white text-4xl">Redirecting...</p>;
};

export default RedirectPage;
