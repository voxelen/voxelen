# Roadmap

Last updated: June 2026 · Version **0.1.0** (alpha)

## Status

SeedAtlas has a working monorepo, WASM biome engine, shared constants/schemas, 
and a minimal client that proves biome lookup in the browser.

## Plan (v0.1.0 → v1.0.0)

Single checklist — grouped by target release. Check items off as each version tags.

### v0.1.0 — Foundation

- [x] Monorepo tooling (Bun, Turbo, TypeScript, Biome)
- [x] cubiomes submodule ([xpple/cubiomes](https://github.com/xpple/cubiomes))
- [x] WASM engine: generator cache + `getBiomeAt` (scale 1)
- [x] `@repo/shared`: Minecraft versions, biomes, structures, dimensions, validation schemas
- [x] Client scaffold (Vite, React, TanStack Router, Mantine)
- [x] WASM integration in client (`useBiomeAt`, engine provider)
- [x] Dynamic PWA manifest (`useDynamicPWA`, route-aware)
- [x] GitHub Pages deploy (`/seed-atlas` base path)
- [x] Docker multi-stage build and CI workflow
- [x] Project docs (README, architecture, cubiomes integration, roadmap)
- [x] Bump version to **0.1.0** and publish GitHub pre-release

### v0.2.0 — Frontend shell

- [ ] Rename project to `Voxelen`
- [ ] Point GitHub Pages to the new repo
- [ ] Update package metadata and any hard-coded URLs in README / CI / docs
- [ ] App layout (header, nav, responsive shell)
- [ ] Home page UI (proper landing)
- [ ] Settings page (placeholders OK: theme, defaults, future prefs)
- [ ] Smoke test page
- [ ] About page
- [ ] Tag release **v0.2.0**

### v0.3.0 — Shared layer & engine alignment

- [ ] dimension-gated biomes, structures and controls
- [ ] Wire `isLargeBiome` through engine `prepare` / cubiomes world type
- [ ] Finalize `MapRequest` / `MapResponse` and `FinderRequest` / `FinderResponse` against engine capabilities
- [ ] Engine export registry ready for new C bindings (`EXPORTS` + `createWasmEngine` methods)

### v0.4.0 — Core map UI controls

- [ ] Seed input (string / int64-safe)
- [ ] Minecraft version, dimension, and biome height controls
- [ ] Large biomes toggle
- [ ] Origin / center coordinate input
- [ ] Structure layer toggles (`enabledStructures`)
- [ ] Highlight selected biomes on the map (`highlightedBiomes`)
- [ ] Structure markers on map from finder results
- [ ] Coordinate readout (cursor block X/Z, optional chunk)

### v0.5.0 — Biome map (engine + renderer)

- [ ] Add core map rendering controls and forms
- [ ] WASM export `genBiomes` wrapping cubiomes `genBiomes` + `Range`
- [ ] Discrete `view.zoom` to cubiomes scale (1 / 4 / 16 / 64 / 256) and sampleY
- [ ] TS API: `engine.genBiomes(MapRequest)` to return `MapResponse`
- [ ] Canvas (or WebGL) renderer using biome ids and colors
- [ ] Viewport pan and zoom with debounced re-fetch
- [ ] Use ids to get tooltip info on hover / click

### v0.6.0 — Structure & biome finders (engine)

- [ ] Enable `finders.c` in WASM build with acceptable bundle size
- [ ] Web Worker for finder searches (keep main thread responsive)
- [ ] WASM exports for structure positions (generic finder API)
- [ ] WASM exports for biome finder (cubiomes biome search)
- [ ] Stronghold finder (special-case cubiomes API)
- [ ] TS API: `engine.find(FinderRequest)` → `FinderResponse`
- [ ] Pagination and radius limits enforced in worker

### v0.7.0 — Finder UI

- [ ] Biome finder panel (pick biome, radius, paginated results)
- [ ] Structure finder panel (pick structure, radius, paginated results)
- [ ] Jump-to-result on map (pan center, drop marker)
- [ ] Result list with distance and recommended zoom
- [ ] Empty, loading, and error states for long searches

### v0.8.0 — Map polish & accuracy

- [ ] Optional grid overlay (chunk or block grid — client-side)
- [ ] Dimension-specific defaults (Nether roof Y, End, etc.)
- [ ] Version-gated biomes, structures and controls
- [ ] Optional terrain / surface-height overlay (TS approximation; not full block gen)
- [ ] Performance: tile cache, cancel in-flight map requests on pan/zoom

### v0.9.0 — Cross-platform (Tauri)

- [ ] Tauri shell wrapping the web client
- [ ] Desktop builds (Linux, macOS, Windows)
- [ ] Mobile-friendly layout and touch pan/zoom refinements
- [ ] Shared engine bundle between web and desktop builds
- [ ] Deep link / URL state for seed, version, coords, and map view

### v1.0.0 — Stable release

- [ ] Ore / block finders (where cubiomes exposes them)
- [ ] Export / share map screenshot or seed summary
- [ ] Bump cubiomes submodule as new MC versions land upstream
- [ ] Stable public engine + shared API (breaking changes require migration note)
- [ ] Complete UI for map, finders, and search context on all three dimensions
- [ ] Acceptable WASM load time and finder performance on mid-range hardware
- [ ] Contributor docs and issue templates in good shape
- [ ] Tagged release **v1.0.0**, changelog, and demo deploy aligned with version

## Non-goals (for now)

- Full block-level world generation or heightmap parity
- Chest loot editing inside the cubiomes submodule from this repo
- Server-side seed processing (everything runs client-side via WASM)
