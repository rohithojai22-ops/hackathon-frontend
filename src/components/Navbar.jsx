export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur bg-black/30">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"></div>
          <span className="font-semibold tracking-wide">Hackathon 2026</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/" className="opacity-80 hover:opacity-100">Home</a>
          <a href="/teams" className="opacity-80 hover:opacity-100">Teams</a>
          <a href="/login" className="opacity-80 hover:opacity-100">Login</a>
        </nav>
      </div>
    </header>
  );
}
