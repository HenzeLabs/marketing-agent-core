import ShopifyRevenueCard from "./ShopifyRevenueCard";
import ClarityPageviewsChart from "./ClarityPageviewsChart";
import AISummaryRecommendations from "./AISummaryRecommendations";
import React, { ReactNode, useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navLinks = [
  { name: "Dashboard", href: "#" },
  { name: "Insights", href: "#" },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:inset-0`}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full py-6 px-4">
          <div className="text-2xl font-bold mb-8 text-blue-700">MI</div>
          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-20 transition-opacity duration-200 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 md:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
          {/* Sidebar toggle for mobile */}
          <button
            className="md:hidden mr-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Open sidebar"
          >
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Marketing Intelligence Dashboard
          </h1>
          <div className="w-32" /> {/* Placeholder for future filters */}
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Shopify Revenue Stat Card */}
            <ShopifyRevenueCard />
            {/* Clarity Pageviews Over Time Line Chart */}
            <ClarityPageviewsChart />
            {/* AI Summary Recommendations */}
            <AISummaryRecommendations />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
