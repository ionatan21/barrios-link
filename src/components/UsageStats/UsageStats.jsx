const UsageStats = ({ links, redirects }) => {
  return (
    <div className="mt-8 animate-fade-in-down  z-30 w-full grid grid-cols-2 gap-4">
      <div className="p-4 text-center">
        <p className="text-white font-sans font-bold text-sm md:text-xl">LINKS CREATED SO FAR: {links}</p>
      </div>
      <div className="p-4 text-center">
        <p className="text-white font-sans font-bold text-sm  md:text-xl">REDIRECTED LINKS: {redirects}</p>
      </div>
    </div>
  );
};

export default UsageStats;
