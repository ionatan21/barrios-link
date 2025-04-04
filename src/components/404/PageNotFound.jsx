import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // Redirect to the homepage after 3 seconds
    }, 2500);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);
  // Redirect to the homepage after 3 seconds
  return (
    <div className="bg-white animate-fade-in-down rounded-2xl p-6 relative w-full max-w-fit flex flex-col items-center">
      <h1 className=" text-2xl text-red-500 inset-0 text-center">
        Page Not Found :(
      </h1>
      <p className="text-center mt-6 text-red-500">
        Redirecting to the homepage...
      </p>
    </div>
  );
}
