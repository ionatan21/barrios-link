import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TooManyRequests() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  });

  return (
    <div className="bg-transparent select-none gap-4 animate-fade-in-down rounded-2xl p-6 relative w-full max-w-fit flex flex-col items-center">
      <h1 className="text-9xl text-white">429</h1>
      <h1 className="text-2xl text-white inset-0 text-center">
        Too Many Requests
      </h1>
      <p className="text-center mt-6 text-white">
        You've made too many requests. Please wait a moment and try again.
      </p>
      <p className="text-center text-white opacity-60 text-sm">
        Redirecting to the homepage in 5 seconds...
      </p>
    </div>
  );
}
