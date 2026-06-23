# Cubiomes integration

SeedAtlas depends on [cubiomes](https://github.com/xpple/cubiomes) for Minecraft world generation logic. It is vendored as a **Git submodule**, not copied directly into this repo.

## Submodule info

```properties
[submodule "packages/engine-wasm/cubiomes"]
	path = packages/engine-wasm/cubiomes
	url = https://github.com/xpple/cubiomes.git
```

The [xpple fork](https://github.com/xpple/cubiomes) extends the original Cubitect library with newer MC versions and additional features (e.g. loot tables). SeedAtlas tracks a specific commit of that fork via the submodule pointer in the parent repo.

## What lives where

| Change | Where |
|--------|-------|
| New cubiomes feature, bug fix, MC version support | **xpple/cubiomes** repo → PR there |
| Bump to a new cubiomes commit | Parent repo: update submodule SHA, commit |
| WASM export, caching, TS API | `packages/engine-wasm/src/native/engine.c`, `src/engine.ts` |
| UI labels, biome colors, version list | `packages/shared/constants/minecraft.ts` |
| Request/response shapes | `packages/shared/validation/` |

Do not land cubiomes source edits only inside the submodule checkout without pushing them to xpple/cubiomes first.

## Clone and update

Initial clone:

```bash
git clone --recurse-submodules https://github.com/codjix/seed-atlas.git
```

Existing clone:

```bash
git submodule update --init --recursive
```

## Build and integration

- `scripts/build.sh` compiles cubiomes and `engine.c` to `engine.wasm` and `engine.js` using Emscripten.
- Importing `engine.wasm` and `engine.js` in `engine.ts` creates a singleton WASM module.
- Exporting wasm module factory `createWasmModule` as a reusable async function.
- The factory resolves to an object with C-compatible function bindings.

## Working with cubiomes

When adding engine features that need cubiomes APIs:

1. Confirm the API exists in xpple/cubiomes.
2. If not, add it and open a PR to xpple/cubiomes.
3. Bump the submodule in SeedAtlas.
4. Add a minimal C export in `engine.c` and TS binding in `engine.ts`.
5. Extend `@repo/shared` types if the UI needs new fields.

For cubiomes behavior questions, refer to the fork’s README and headers (`generator.h`, `biomes.h`, `finders.h`) or open an issue on the appropriate repo.
