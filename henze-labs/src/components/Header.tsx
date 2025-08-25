export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-secondary/50">
      <div className="container h-14 flex items-center justify-between">
        <a href="/" className="font-display text-lg">
          HL
        </a>
        <nav className="hidden md:flex items-center gap-6 text-content-muted">
          <a href="/demo">Demo</a>
          <a href="/pricing">Pricing</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
        <a href="/demo" className="btn-primary">
          Start 30-day pilot
        </a>
      </div>
    </header>
  );
}
