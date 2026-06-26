import type { CommonContext } from "@repo/shared/validation";
import engineWasmUrl from "../dist/engine.wasm?url";

// ========== Module singleton ==========
const wasmModule = (async () => {
  const url = new URL("../dist/engine.js", import.meta.url).href;
  const { default: createModule } = await import(/* @vite-ignore */ url);
  return createModule({
    locateFile: (path: string) => (path.endsWith(".wasm") ? engineWasmUrl : path),
  });
})();

// ========== Function registry ==========
// Add new C exports here
const EXPORTS: Record<string, { ret: string; args: string[] }> = {
  get_biome_at: { ret: "number", args: Array(7).fill("number") },
  // search_targets
  // render_markers
  // render_tile
  // free_buffer
};

const wasmRegistry = wasmModule.then((mod) => {
  const entries = Object.entries(EXPORTS).map(([k, v]) => [k, mod.cwrap(k, v.ret, v.args)]);
  return Object.fromEntries(entries) as Record<keyof typeof EXPORTS, (...args: number[]) => number>;
});

// ========== Engine API ==========
export type WasmEngine = Awaited<ReturnType<typeof createWasmEngine>>;

export const createWasmEngine = () =>
  wasmRegistry.then((module) => ({
    // Add new methods here
    getBiomeAt(ctx: CommonContext) {
      const s = BigInt(ctx.seed) & ((1n << 64n) - 1n);
      const [seedHi, seedLo] = [Number(s >> 32n), Number(s & 0xffffffffn)];
      return module.get_biome_at(
        ctx.versionId,
        ctx.dimension,
        seedHi,
        seedLo,
        ctx.isLargeBiome ? 1 : 0,
        ctx.coordinates.x,
        ctx.biomeHeight,
        ctx.coordinates.z,
      );
    },
  }));
