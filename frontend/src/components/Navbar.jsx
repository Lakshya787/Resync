import { Link } from "react-router-dom";
import ResyncLogo from "./ResyncLogo";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1220]/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/">
          <ResyncLogo size="md" />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6 text-sm">

          <Link
            to="/about"
            className="text-slate-300 hover:text-[#38BDF8] transition"
          >
            About
          </Link>

          <Link
            to="/login"
            className="text-slate-300 hover:text-white transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-[#38BDF8] text-black px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Get Started
          </Link>

        </div>
      </div>
    </nav>
  );
}