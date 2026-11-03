# ORION constellation redesign

Monochrome "Earned, not favoured" look based on the 2026-27 Core Committee poster.

- `src/components/ConstellationBackground.jsx`: WebGL (three.js) celestial sphere behind the whole site. ~7,500 parallaxing stars, a Milky Way band with nebula haze, shooting stars, and seven constellations (Orion, Ursa Major, Cassiopeia, Cygnus, Scorpius, Lyra, Crux) that draw their lines in as they come into view. Scrolling turns the sky; the mouse tilts the camera. Respects reduced motion, pauses in hidden tabs, uses fewer stars on phones, and falls back to a CSS starfield without WebGL.
- `src/index.css`: Tailwind palette remapped (amber -> starlight silver, cyan -> steel blue, slate -> deep space neutrals), so every existing component picks up the new theme. Fonts: Montserrat (display), Bodoni Moda (serif accents), Inter (body).
- `src/components/Hero.jsx`: poster-style hero with the real ORION mark tilting in 3D inside a rotating star chart.
- Navbar and footer use the ORION mark; Microsoft sign-in buttons restyled to white.
- `src/assets/orion-mark.png`, `public/favicon.png`: logo extracted from the supplied image.
- New dependency: `three`.

Run: `npm install && npm run dev`.
