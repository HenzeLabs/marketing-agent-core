// src/pages/Landing.tsx

export default function Landing() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent section">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-display text-content">
            Cut RevOps grunt work{" "}
            <span className="text-primary">without hiring</span>.
          </h1>
          <p className="mt-6 text-lg text-content-muted max-w-2xl mx-auto">
            Automate reporting & data syncs. Launch in days, not months.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <a href="/demo" className="btn-primary">
              See live demo
            </a>
            <a href="/pricing" className="btn-ghost">
              Pricing
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
