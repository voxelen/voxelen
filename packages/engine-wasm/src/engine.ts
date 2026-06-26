import type {
  CommonContext,
  MarkersRequest,
  MarkersResponse,
  SearchRequest,
  SearchResponse,
  Target,
  TileRequest,
} from "@repo/shared/validation";
import engineWasmUrl from "../dist/engine.wasm?url";

// ===== Types =====

type WasmTools = {
  cwrap: (name: string, ret: string | null, args: string[]) => (...args: number[]) => number;
  HEAP32: Int32Array;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
};

// ===== Module singleton =====

const wasmModule: Promise<WasmTools> = (async () => {
  const url = new URL("../dist/engine.js", import.meta.url).href;
  const { default: createModule } = await import(/* @vite-ignore */ url);
  return createModule({
    locateFile: (path: string) => (path.endsWith(".wasm") ? engineWasmUrl : path),
  });
})();

// ===== Function registry =====

const EXPORTS: Record<string, { ret: string | null; args: string[] }> = {
  get_biome_at: { ret: "number", args: Array(8).fill("number") },
  render_tile: { ret: "number", args: Array(11).fill("number") },
  render_markers: { ret: "number", args: Array(11).fill("number") },
  search_targets: { ret: "number", args: Array(13).fill("number") },
  free_buffer: { ret: null, args: ["number"] },
};

const wasmRegistry = wasmModule.then((tools) => {
  type Module = Record<keyof typeof EXPORTS, (...args: number[]) => number>;
  const entries = Object.entries(EXPORTS).map(([k, v]) => [k, tools.cwrap(k, v.ret, v.args)]);
  const module = Object.fromEntries(entries) as Module;

  return { tools, module };
});

// ===== Helpers =====

function unpackSeed(seed: string | bigint): [number, number] {
  const s = BigInt(seed) & 0xffffffffffffffffn;
  return [Number(s >> 32n), Number(s & 0xffffffffn)];
}

function parseTargets(tools: WasmTools, ptr: number, count: number, offset: number): Target[] {
  const targets: Target[] = [];
  for (let i = 0; i < count; i++) {
    const x = tools.HEAP32[(ptr >> 2) + offset + i * 3];
    const z = tools.HEAP32[(ptr >> 2) + offset + i * 3 + 1];
    const targetId = tools.HEAP32[(ptr >> 2) + offset + i * 3 + 2];
    targets.push({ targetId, coord: { x, z }, distance: 0, attributes: [] });
  }
  return targets;
}

// ===== Zoom → cubiomes scale =====
// Refined in v0.5.0 when tile renderer is built.
// zoom = pixels per block.
function zoomToScale(zoom: number): number {
  if (zoom >= 4) return 1;
  if (zoom >= 1) return 4;
  if (zoom >= 0.25) return 16;
  if (zoom >= 0.06) return 64;
  return 256;
}

// ===== Engine API =====

export type WasmEngine = Awaited<ReturnType<typeof createWasmEngine>>;

export async function createWasmEngine() {
  return wasmRegistry.then(({ tools, module }) => ({
    getBiomeAt(ctx: CommonContext): number {
      const [seedHi, seedLo] = unpackSeed(ctx.seed);
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

    renderTile(req: TileRequest): Int32Array {
      const [seedHi, seedLo] = unpackSeed(req.seed);
      const { width, height, zoom } = req.view;
      const scale = zoomToScale(zoom);
      // biome cells = block_size / scale
      const cellW = Math.ceil(width / scale);
      const cellH = Math.ceil(height / scale);

      const ptr = module.render_tile(
        req.versionId,
        req.dimension,
        seedHi,
        seedLo,
        req.isLargeBiome ? 1 : 0,
        req.coordinates.x,
        req.coordinates.z,
        cellW,
        cellH,
        scale,
        req.biomeHeight,
      );
      if (!ptr) throw new Error("render_tile: allocation failed");

      const view = new Int32Array(tools.HEAP32.buffer, ptr, cellW * cellH);
      const result = new Int32Array(view); // copy before freeing
      module.free_buffer(ptr);
      return result;
    },

    renderMarkers(req: MarkersRequest): MarkersResponse {
      const [seedHi, seedLo] = unpackSeed(req.seed);
      const { width, height } = req.view;
      const cx = req.coordinates.x;
      const cz = req.coordinates.z;
      // viewport bounds in block coords
      const x1 = cx - Math.floor(width / 2);
      const z1 = cz - Math.floor(height / 2);
      const x2 = cx + Math.ceil(width / 2);
      const z2 = cz + Math.ceil(height / 2);

      const structPtr = tools._malloc(req.structures.length * 4);
      for (let i = 0; i < req.structures.length; i++) {
        tools.HEAP32[(structPtr >> 2) + i] = req.structures[i];
      }

      const ptr = module.render_markers(
        req.versionId,
        req.dimension,
        seedHi,
        seedLo,
        req.isLargeBiome ? 1 : 0,
        x1,
        z1,
        x2,
        z2,
        structPtr,
        req.structures.length,
      );

      tools._free(structPtr);
      if (!ptr) throw new Error("render_markers: allocation failed");

      const count = tools.HEAP32[ptr >> 2];
      const targets = parseTargets(tools, ptr, count, 1);
      module.free_buffer(ptr);

      // compute distance from center
      return targets.map((t) => ({
        ...t,
        distance: Math.sqrt((t.coord.x - cx) ** 2 + (t.coord.z - cz) ** 2),
      }));
    },

    searchTargets(req: SearchRequest): SearchResponse {
      const [seedHi, seedLo] = unpackSeed(req.seed);
      const targetType = req.targetType === "biome" ? 0 : 1;
      const radius = req.radius ?? 5000;
      const start = performance.now();

      const ptr = module.search_targets(
        req.versionId,
        req.dimension,
        seedHi,
        seedLo,
        req.isLargeBiome ? 1 : 0,
        req.coordinates.x,
        req.coordinates.z,
        req.biomeHeight,
        targetType,
        req.targetId,
        radius,
        req.limit,
        req.page,
      );
      if (!ptr) throw new Error("search_targets: allocation failed");

      const total = tools.HEAP32[(ptr >> 2) + 0];
      const count = tools.HEAP32[(ptr >> 2) + 1];
      const targets = parseTargets(tools, ptr, count, 2);
      module.free_buffer(ptr);

      const cx = req.coordinates.x;
      const cz = req.coordinates.z;

      return {
        results: targets.map((t) => ({
          ...t,
          distance: Math.sqrt((t.coord.x - cx) ** 2 + (t.coord.z - cz) ** 2),
        })),
        meta: {
          total,
          searchTime: performance.now() - start,
        },
      };
    },
  }));
}
