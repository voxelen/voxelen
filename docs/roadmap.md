# Roadmap

Last updated: June 2026 · Version **0.2.0** (alpha)

## Status

Voxelen has a working monorepo, WASM biome engine with generator cache, shared
constants/schemas, a client scaffold with routing and settings, and a smoke test
view proving biome lookup in the browser. The engine C/TS API and worker
architecture are being redesigned before the map renderer is built.

## Plan (v0.2.0 → v1.0.0)

### v0.2.0 — Frontend shell ✦ current

- [x] Rename project to Voxelen
- [x] App layout (header, nav, responsive shell)
- [x] Smoke test view (`getBiomeAt`)
- [x] Settings page (theme, defaults)
- [x] About page
- [x] Home page UI (proper landing)
- [x] Tag release **v0.2.0**

### v0.3.0 — Engine & worker foundation

- [x] Finalize C function signatures: `render_tile`, `render_markers`, `search_targets`, `free_buffer`
- [x] Implement and compile all C exports with binary buffer protocol
- [x] `engine.worker.ts`: WASM loaded in worker, message dispatch with correlation IDs
- [x] Refactor `WasmEngineProvider` to use worker, expose promise-based API
- [x] Update `EXPORTS` registry and `engine.ts` methods for all new C functions
- [x] Smoke test updated to verify worker round-trip

### v0.4.0 — Canvas & viewport

- [ ] Viewport state: `centerX`, `centerZ`, `zoom` (pixels per block)
- [ ] `usePanZoom`: mouse drag, wheel zoom, pinch-to-zoom, zoom anchored to cursor/pinch midpoint
- [ ] Canvas fills container with `ResizeObserver`
- [ ] Debug text overlay: live viewport state (center coords, zoom, derived scale)

### v0.5.0 — Map renderer

- [ ] All map controls: seed input (int64-safe), version, dimension, biome height, `isLargeBiome`
- [ ] Structure multiselect (which markers to render)
- [ ] Biome highlight multiselect
- [ ] `render_tile` wired to canvas: biome color lookup, highlighted biome layer
- [ ] `render_markers` wired to canvas: structure markers rendered on top of tiles
- [ ] Tile cache with LRU eviction
- [ ] Center-outward tile render queue, cancel in-flight requests on viewport change
- [ ] Zoom level → cubiomes scale mapping (1 / 4 / 16 / 64 / 256)
- [ ] Coordinate readout on hover (block X/Z, chunk)
- [ ] Click marker → info popup (type, coord, distance from origin)
- [ ] Dimension-gated and version-gated controls, biomes, and structures

### v0.6.0 — Map polish

- [ ] Optional chunk/block grid overlay (adapts to zoom level)
- [ ] Nether and End dimension defaults (roof Y, scale quirks)
- [ ] `isLargeBiome` wired through engine `prepare` / cubiomes world flags
- [ ] Coordinate jump input (pan to X/Z)
- [ ] Map screenshot export

### v0.7.0 — Finder

- [ ] `search_targets` C + TS: biome finder, structure finder, stronghold special case
- [ ] Paginated results with distance, sorted nearest-first
- [ ] Biome finder UI panel
- [ ] Structure finder UI panel
- [ ] Jump-to-result: pan map to target coord, drop temporary marker
- [ ] Loading, empty, and error states

### v0.8.0 — Performance & accuracy

- [ ] Tile throughput profiling and tuning (scale, batch size, worker concurrency)
- [ ] Acceptable WASM load time and finder performance on mid-range hardware
- [ ] Optional terrain/height overlay (TS approximation)
- [ ] Stress test across all dimensions and version ranges

### v0.9.0 — Cross-platform (Tauri)

- [ ] Tauri shell wrapping the web client
- [ ] Desktop builds: Linux, macOS, Windows
- [ ] Mobile builds: iOS, Android (Tauri mobile)
- [ ] Touch pan/zoom refinements for mobile viewports
- [ ] Shared engine WASM bundle across web and all native targets
- [ ] URL/deep link state for seed, version, coords, and viewport

### v1.0.0 — Stable release

- [ ] Ore/block finders (where cubiomes exposes them)
- [ ] Bump cubiomes submodule as new MC versions land upstream
- [ ] Full dimension coverage: Overworld, Nether, End
- [ ] Stable public engine + shared API (breaking changes → migration note)
- [ ] Contributor docs and issue templates
- [ ] Tagged **v1.0.0**, changelog, demo deploy

## Non-goals (for now)

- Full block-level world generation or heightmap parity
- Chest loot editing inside the cubiomes submodule
- Server-side seed processing (everything runs client-side via WASM)