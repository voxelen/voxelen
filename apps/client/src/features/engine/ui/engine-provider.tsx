import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import type { WorkerEngine, WorkerRequest, WorkerResponse } from "../engine.worker";
import EngineWorker from "../engine.worker?worker";

// ===== Context =====

export type EngineState =
  | { status: "loading" }
  | { status: "ready"; engine: WorkerEngine }
  | { status: "error"; error: Error };

const EngineCtx = createContext<EngineState | null>(null);

export function useEngine() {
  const ctx = useContext(EngineCtx);
  if (!ctx) throw new Error("useEngine must be used within EngineProvider");
  return ctx;
}

// ===== Provider =====

export function EngineProvider({ children }: { children?: ReactNode }) {
  const [state, setState] = useState<EngineState>({ status: "loading" });
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<
    Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>
  >(new Map());
  const nextIdRef = useRef(0);

  useEffect(() => {
    const worker = new EngineWorker();
    workerRef.current = worker;

    worker.onerror = (e) => setState({ status: "error", error: new Error(e.message) });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id } = event.data;
      const pending = pendingRef.current.get(id);
      if (!pending) return;
      pendingRef.current.delete(id);

      if ("error" in event.data) {
        pending.reject(new Error(event.data.error));
      } else {
        pending.resolve(event.data.result);
      }
    };

    // Helper: send a message and return a promise for its response
    function call<T>(
      type: WorkerRequest["type"],
      payload?: unknown,
      transfer?: Transferable[],
    ): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const id = nextIdRef.current++;
        pendingRef.current.set(id, { resolve: resolve as (v: unknown) => void, reject });
        const msg = payload !== undefined ? { id, type, payload } : { id, type };
        worker.postMessage(msg, transfer ?? []);
      });
    }

    // Warm up the engine (loads WASM in worker)
    call<boolean>("init")
      .catch((error) => setState({ status: "error", error }))
      .then(() => {
        setState({
          status: "ready",
          engine: {
            getBiomeAt: (payload) => call("getBiomeAt", payload),
            renderTile: (payload) => call("renderTile", payload),
            renderMarkers: (payload) => call("renderMarkers", payload),
            searchTargets: (payload) => call("searchTargets", payload),
          },
        });
      });

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, []);

  return <EngineCtx value={state}>{children}</EngineCtx>;
}
