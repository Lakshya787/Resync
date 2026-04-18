export default function Footer() {
  return (
    <footer className="px-8 py-8 border-t-2 border-border text-sm font-bold tracking-wide bg-background text-foreground uppercase">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left */}
        <p className="text-xs">
          © {new Date().getFullYear()} Resync. All rights reserved.
        </p>

        {/* Right */}
        <div className="flex gap-8">
          <a href="#" className="hover:text-primary transition-colors">
            About
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Terms
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
