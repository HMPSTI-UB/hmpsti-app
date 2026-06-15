import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl sm:text-2xl font-bold">
            <span className="text-white">KABINET</span>
            <span className="text-primary ml-2">INNOVARA</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#filosofi"
            className="text-white/80 hover:text-primary transition"
          >
            Filosofi
          </a>
          <a
            href="#visi-misi"
            className="text-white/80 hover:text-primary transition"
          >
            Visi & Misi
          </a>
          <a
            href="#program"
            className="text-white/80 hover:text-primary transition"
          >
            Program
          </a>
          <a
            href="#departemen"
            className="text-white/80 hover:text-primary transition"
          >
            Departemen
          </a>
        </div>

        <div className="md:hidden">
          <button className="text-primary p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
