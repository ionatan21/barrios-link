import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_ENDPOINTS } from "@/config/api";

const RedirectPage = () => {
  const { slug } = useParams();

  useEffect(() => {
    window.location.href = API_ENDPOINTS.getUrl(slug);
  }, [slug]);

  return (
    <p className="w-screen animate-fade-in-down text-center z-10 text-white text-4xl">
      Redirecting...
    </p>
  );
};

export default RedirectPage;