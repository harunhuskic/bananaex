# BananaEx

BananaEx is a full-stack currency dashboard that combines live exchange-rate data with conversion history, authentication, charts, an interactive 3D globe, and a bilingual dark-mode interface.

## What it demonstrates

- React 19 and Vite frontend architecture
- Express 5 API proxy with CORS and environment configuration
- Supabase authentication, PostgreSQL tables, and row-level-security migrations
- Currency conversion and historical-rate charts with Recharts
- BAM conversion derived from the official EUR peg
- Interactive geography using Three.js and `react-globe.gl`
- Optimistic conversion-history updates and responsive UI design
- English/Bosnian localization and persistent theme preferences

## Project structure

```text
frontend/   React application and Supabase client
backend/    Express currency and RSS proxy API
supabase/   Database migrations and security policies
```

## Local setup

### Backend

```bash
cd backend
npm install
node server.js
```

### Frontend

Copy `frontend/.env.example` to `frontend/.env`, add your Supabase project values, and then run:

```bash
cd frontend
npm install
npm run dev
```

## Data sources and scope

Exchange-rate requests are proxied through the backend using the Frankfurter API. BAM is calculated from its fixed EUR relationship.

The heatmap, short-term movement indicators, Banana Index examples, and alert triggers are demonstration features rather than live trading signals. BananaEx is an educational portfolio project and not financial advice.

