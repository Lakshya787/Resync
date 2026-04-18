import { Link } from "react-router-dom";
import ResyncLogo from "./ResyncLogo";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b-2 border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="hover:scale-105 transition-transform duration-200">
          <ResyncLogo size="md" />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8 text-sm font-bold uppercase tracking-wider">

          <Link
            to="/about"
            className="text-foreground hover:text-primary transition-colors"
          >
            About
          </Link>

          <Link
            to="/login"
            className="text-foreground hover:text-primary transition-colors"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-primary text-white px-6 h-12 flex items-center rounded-md hover:bg-blue-600 hover:scale-105 transition-all duration-200"
          >
            Get Started
          </Link>

        </div>
      </div>
    </nav>
  );
}