export default function Footer() {
  return (
    <footer className="z-1000 w-full text-white h-10 py-6 px-4 text-center">
      <div className="text-sm text-center  text-white">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <a
            className="text-white hover:text-white"
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
