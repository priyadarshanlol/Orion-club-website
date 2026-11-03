# ORION Club Website

Official website of Club ORION, REVA University, Bengaluru. *Earned, not favoured.*

A React + Vite + Tailwind CSS site with a 3D animated constellation background (three.js), the five ORION wings, member hub, recruitment portal, events, team hierarchy and contact. Firebase handles sign-in and live data; without Firebase settings the site runs on built-in sample data.

## Run locally

```bash
npm install
npm run dev
```

Build for production with `npm run build` (output in `dist/`).

## Firebase

Copy `.env.example` to `.env` and fill in your Firebase project values to enable sign-in and live data.

See [REDESIGN.md](REDESIGN.md) for what the constellation redesign changed.
