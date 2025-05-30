export default function Footer() {
  return (
    <footer className="z-50 w-full text-white h-10 py-6 px-4 text-center">
      <div className="text-sm text-center  text-gray-400">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <a
            className="text-gray-400 hover:text-gray-400"
            href="https://portfolio-jonatan-barrios.vercel.app/"
          >
            Jonatan Barrios
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
