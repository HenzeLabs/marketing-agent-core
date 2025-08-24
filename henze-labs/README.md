# Henze Labs Demo Site

## Getting Started

1. **Install dependencies:**
   ```sh
   cd henze-labs
   npm install
   ```
2. **Set environment variable:**
   - Copy `.env.example` to `.env` and set `VITE_API_BASE` to your API URL.
   - Example:
     ```
     VITE_API_BASE=https://marketing-agent-core-906749953116.us-east1.run.app
     ```
3. **Run the dev server:**

   ```sh
   npm run dev
   ```

   - Local dev URL: http://localhost:5173/

4. **Build for production:**
   ```sh
   npm run build
   ```

## Environment Variables

- `.env` (not committed):
  - `VITE_API_BASE` — Your Cloud Run API base URL
- `.env.example` — Template for required env vars

## Deploy

- Recommended: [Vercel](https://vercel.com/)
- Set `VITE_API_BASE` in Vercel project settings
- Zero-config static deploy

## Features

- Landing page: headline, value bullets, email CTA
- Live metrics: sessions, revenue, top URLs (API-driven)
- Privacy/Terms pages
- Responsive, accessible, Lighthouse ≥90

## Quality Gates

- `npm run dev` — no console errors
- `npm run build` — zero TypeScript errors
- Live API fetches succeed

## File Structure

- `src/pages/` — Page components
- `src/components/` — UI components
- `src/lib/api.ts` — API data layer

---

Questions? hello@henzelabs.com
