import type { CommonContext } from "@repo/shared/validation";
import { useEffect, useState } from "react";
import { useWasmEngine } from "../ui/wasm-engine";

export function useBiomeAt(input: CommonContext) {
  const wasm = useWasmEngine();
  const [state, setState] = useState<number | undefined>();

  useEffect(() => {
    try {
      if (wasm.status === "ready") {
        setState(wasm.engine.getBiomeAt(input));
      }
    } catch (err) {
      console.error(err);
      setState(undefined);
    }
  }, [wasm, input]);

  return state;
}
