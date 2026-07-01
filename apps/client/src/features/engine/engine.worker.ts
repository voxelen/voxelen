import { createWasmEngine, type WasmEngine } from "@repo/engine-wasm";
import type {
  CommonContext,
  MarkersRequest,
  MarkersResponse,
  SearchRequest,
  SearchResponse,
  TileRequest,
} from "@repo/shared/validation";

// ===== Types =====

export type WorkerEngine = {
  getBiomeAt: (payload: CommonContext) => Promise<number>;
  renderTile: (payload: TileRequest) => Promise<Int32Array>;
  renderMarkers: (payload: MarkersRequest) => Promise<MarkersResponse>;
  searchTargets: (payload: SearchRequest) => Promise<SearchResponse>;
};

export type WorkerRequest =
  | { id: number; type: "init" }
  | { id: number; type: "getBiomeAt"; payload: CommonContext }
  | { id: number; type: "renderTile"; payload: TileRequest }
  | { id: number; type: "renderMarkers"; payload: MarkersRequest }
  | { id: number; type: "searchTargets"; payload: SearchRequest };

export type WorkerResponse = { id: number; result: unknown } | { id: number; error: string };

// ===== Engine singleton =====

let enginePromise: Promise<WasmEngine> | null = null;

function getEngine(): Promise<WasmEngine> {
  if (!enginePromise) enginePromise = createWasmEngine();
  return enginePromise;
}

// ===== Dispatch =====

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, type } = event.data;

  try {
    const engine = await getEngine();

    switch (type) {
      case "init":
        // engine is already initialized by getEngine() above
        self.postMessage({ id, result: true } satisfies WorkerResponse);
        break;

      case "getBiomeAt": {
        const result = engine.getBiomeAt(event.data.payload);
        self.postMessage({ id, result } satisfies WorkerResponse);
        break;
      }

      case "renderTile": {
        const result = engine.renderTile(event.data.payload);
        // transfer the buffer to avoid copying
        self.postMessage({ id, result } satisfies WorkerResponse, {
          transfer: [result.buffer],
        });
        break;
      }

      case "renderMarkers": {
        const result = engine.renderMarkers(event.data.payload);
        self.postMessage({ id, result } satisfies WorkerResponse);
        break;
      }

      case "searchTargets": {
        const result = engine.searchTargets(event.data.payload);
        self.postMessage({ id, result } satisfies WorkerResponse);
        break;
      }
    }
  } catch (err) {
    console.error(err);
    self.postMessage({ id, error: String(err) } satisfies WorkerResponse);
  }
};
