# Marketing Console

Isolated console dashboard for marketing analytics at console.henzelabs.com.

## API Endpoints Used

- **Sessions (28d)**: `GET /api/metrics/ga4-daily?brand={brand}&days=28`
- **Revenue KPIs**: `GET /api/metrics/revenue?brand={brand}&range=last_30_days`
- **WoW Summary**: `GET /api/summary/wow?brand={brand}`
- **MoM Summary**: `GET /api/summary/mom?brand={brand}`
- **Top Hotspots**: `GET /api/clarity/hotspots?brand={brand}&range=last_7_days`

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Post-Deploy Steps (Netlify)

1. **Create New Netlify Site**
   - Deploy from `console-ui/` subdirectory (not root)
   - Use build command: `npm run build`
   - Publish directory: `dist`

2. **Set Site Password**
   - Go to Netlify → Site settings → Visitor access
   - Enable Site Password protection

3. **Configure Custom Domain**
   - Add DNS record: `CNAME console → your-new-site.netlify.app`
   - In Netlify → Domain settings → Add custom domain: `console.henzelabs.com`

## Features

- Brand selector (Hot Ash, Lab Essentials)
- 28-day sessions chart (HTML/SVG)
- Revenue KPIs with WoW/MoM changes
- Top 10 hotspots from last 7 days
- Auto-refresh support: `?autorefresh=60` (seconds)
- Responsive Tailwind design

## Security

- `X-Robots-Tag: noindex, nofollow` (search engines blocked)
- Site password protection (set after deploy)
- Direct API calls to Cloud Run (no proxy)