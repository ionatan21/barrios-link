import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // Redirect to the homepage after 3 seconds
    }, 20500);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [navigate]);
  // Redirect to the homepage after 3 seconds
  return (
    <div className="bg-transparent select-none gap-4 animate-fade-in-down rounded-2xl p-6 relative w-full max-w-fit flex flex-col items-center">
      <h1 className="text-2xl text-white inset-0 text-center">
        Page not found
      </h1>
      <p className="text-center text-white max-w-xs">
        The page you're looking for doesn't exist.
      </p>
      <p className="text-center mt-2 text-white">
        Redirecting to the homepage...
      </p>
    </div>
  );
}
