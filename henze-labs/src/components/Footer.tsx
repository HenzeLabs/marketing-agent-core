import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-8 py-6 text-sm text-gray-500">
      <Link to="/privacy" className="hover:underline">
        Privacy
      </Link>
      <Link to="/terms" className="hover:underline">
        Terms
      </Link>
    </footer>
  );
}
