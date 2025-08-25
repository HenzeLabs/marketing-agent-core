/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "marketing-navy": "#1B335E",
        "marketing-slate": "#4A6C9B",
        "marketing-cyan": "#00C7C7",
        "marketing-off-white": "#F8F9FA",
        "marketing-gray-light": "#E0E7FF",
        "marketing-charcoal": "#0D1B2A",
        "marketing-text-light": "#F0F4F8",
        "marketing-orange": "#FF8C42",
        // legacy/compat
        primary: { DEFAULT: "#2563EB", 600: "#1D4ED8", 700: "#1E40AF" },
        secondary: "#E2E8F0",
        accent: "#0891B2",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        content: { DEFAULT: "#0F172A", muted: "#64748B" },
        success: "#166534",
        warning: "#92400E",
        danger: "#B91C1C",
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "1rem",
        xl: "2rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      ringColor: { DEFAULT: "#3B82F6" },
      // If you want extras without breaking defaults:
      // spacing: { "18": "4.5rem", "72": "18rem", "84": "21rem", "96": "24rem" },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
