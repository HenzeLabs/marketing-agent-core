// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Metrics from "./pages/Metrics";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { Header } from "./components/Header";
import Footer from "./components/Footer";

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">404 – Not Found</h1>
      <p className="text-content-muted mb-6">
        Sorry, the page you requested does not exist.
      </p>
      <a href="/" className="btn-primary">
        Go Home
      </a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/demo" element={<Metrics />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
