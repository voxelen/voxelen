import type { CommonContext } from "@repo/shared/validation";
import { useEffect, useState } from "react";
import { useEngine } from "../ui/engine-provider";

export function useBiomeAt(input: CommonContext) {
  const engine = useEngine();
  const [state, setState] = useState<number | undefined>();

  useEffect(() => {
    try {
      if (engine.status === "ready") {
        engine.engine.getBiomeAt(input).then(setState);
      }
    } catch (err) {
      console.error(err);
      setState(undefined);
    }
  }, [engine, input]);

  return state;
}
