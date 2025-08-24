import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow rounded-b-2xl">
      <div className="text-2xl font-bold text-blue-700">HL</div>
      <nav className="flex gap-6 items-center">
        <Link to="/demo" className="text-blue-700 hover:underline">
          Demo
        </Link>
        <span className="text-gray-400 cursor-not-allowed">Pricing</span>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Start 30-day pilot
        </Link>
      </nav>
    </header>
  );
}
