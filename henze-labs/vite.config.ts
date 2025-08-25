import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "./",
  publicDir: "public",
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    open: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
