# Seed Atlas

Modern seed mapping tool for discovering Minecraft biomes and structures with ease.

> **Early alpha** — See the [roadmap](docs/roadmap.md) for current status and planned work.

## Features

- Web client built with React, Vite, and Mantine
- WASM generation engine powered by [cubiomes](https://github.com/xpple/cubiomes) (xpple fork)
- Shared Minecraft constants and request schemas (`@repo/shared`)
- Biome lookup at a block coordinate (`getBiomeAt`) — dev smoke test today, map UI coming next

## Live demo

[https://codjix.github.io/seed-atlas](https://codjix.github.io/seed-atlas)

## Development

### Prerequisites

- [Bun](https://bun.sh) Development runtime
- `Git` with submodule support
- [Emscripten](https://emscripten.org) `emcc` on your `PATH` to **build the WASM engine**.

### Installation

```bash
git clone --recurse-submodules https://github.com/codjix/seed-atlas.git
cd seed-atlas
bun install
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

### Usage

Build Wasm Engine:

```bash
cd packages/engine-wasm && bun run build
```

Start the development server:

```bash
bun turbo dev
```

Open [http://localhost:3000](http://localhost:3000).

To build everything:

```bash
bun turbo build
```

Code quality:

```bash
bun turbo format
bun turbo check
bun turbo type-check
```

## Project structure

| Path | Role |
|------|------|
| `apps/client` | Web client - cross-platform mobile and desktop soon |
| `packages/engine-wasm` | TypeScript and WebAssembly wrapper around cubiomes |
| `packages/engine-wasm/cubiomes` | Git submodule — upstream from [xpple/cubiomes](https://github.com/xpple/cubiomes) fork |
| `packages/shared` | Shared constants, types, validation schemas and more |

For system design details, see [architecture.md](docs/architecture.md). 
For cubiomes integration see [cubiomes.md](docs/cubiomes.md).


## Contributing

Issues and pull requests are welcome. A few ground rules:

- Check the [roadmap](docs/roadmap.md) before starting large features — align on priorities first.
- Run `bun run format` before committing.
- Do **not** commit changes inside `packages/engine-wasm/cubiomes` from this repo; upstream changes belong in the [xpple/cubiomes](https://github.com/xpple/cubiomes) fork, then bump the submodule pointer here.

## License

MIT — see [LICENSE](LICENSE).
