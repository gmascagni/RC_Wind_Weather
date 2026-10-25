# RC Wind Weather — Flight Telemetry Deck

Live site: **[https://gmascagni.github.io/RC_Wind_Weather/](https://gmascagni.github.io/RC_Wind_Weather/)**

An avionics-grade mobile weather and wind dashboard built for RC airplane pilots. Search any city or ZIP code worldwide, locate your flying field automatically via **GPS**, and star your favorite club airfields for one-tap switching. Designed for bright outdoor smartphone viewing and installable as a standalone home-screen PWA.

## Key Capabilities

- **Instant Go / Marginal / No-Go Verdict**: Evaluates sustained 10m wind, peak gusts, gust spread, active precipitation, visibility, and ambient LiPo/airframe temperature limits.
- **Tuned for 60-Class Electric Warbirds (Customizable)**: Ships with sensible defaults for 60-class electric warbirds (max 14 mph sustained, 20 mph gusts, 8 mph gust spread) plus one-tap presets (*Micro/Park Flyer*, *Sport/Trainer*, *60-Class Warbird*, *Giant Scale*) and custom sliders saved in `localStorage`.
- **SVG Wind Compass & Runway Crosswind Calculator**: Distinguishes meteorological wind origin (**FROM**) vs. airflow vector (**BLOWING TO**), with a user-configurable runway heading (`000°–359°`) computing exact headwind/tailwind and crosswind components.
- **24-Hour Sustained vs. Gust SVG Chart & Telemetry**: Pure inline SVG wind/gust envelope chart highlighting the **Best Flying Window**, paired with swipeable hourly cards and a sticky-header telemetry log.
- **Multi-Unit & Sunlight Support**: Switch seamlessly between `mph`, `kt`, and `km/h`, and toggle **Daylight Boost** for direct outdoor sunlight contrast.
- **Offline-Resilient PWA**: Caches the app shell via Service Worker under `/RC_Wind_Weather/` and persists last-good telemetry per location in `localStorage` with staleness indicators.

## Tech Stack

- **React 19** + **Vite 8** (Plain ES Modules, zero external state or chart bloat)
- **Tailwind CSS 4** (`@tailwindcss/vite` with `@theme` design tokens)
- **Lucide React** icons
- **Open-Meteo Forecast API** (`America/New_York` timezone, `unixtime` epoch precision, no API key required)
- **Oxlint** static analysis

## Local Development

```bash
npm ci
npm run dev       # Start dev server
npm run lint      # Run Oxlint checks
npm run build     # Build production bundle to dist/
npm run preview   # Preview production build at /RC_Wind_Weather/
```
