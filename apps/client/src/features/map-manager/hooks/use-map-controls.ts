import { useDebouncedValue } from "@mantine/hooks";
import { MAP_CONTROLS } from "@repo/shared/constants";
import { useAtom } from "jotai/react";
import * as store from "../store";

export const useMapControls = () => {
  const [seed, setSeed] = useAtom(store.seedAtom);
  const [seedValue] = useDebouncedValue(seed, 500);
  const [versionId, setVersionId] = useAtom(store.versionIdAtom);
  const [dimension, setDimension] = useAtom(store.dimensionAtom);
  const [isLargeBiome, setIsLargeBiome] = useAtom(store.isLargeBiomeAtom);
  const [coordinates, setCoordinates] = useAtom(store.coordinatesAtom);
  const [coordinatesValue] = useDebouncedValue(coordinates, 500);
  const [biomeHeight, setBiomeHeight] = useAtom(store.biomeHeightAtom);
  const [structures, setStructures] = useAtom(store.structuresAtom);
  const [biomes, setBiomes] = useAtom(store.biomesAtom);

  const reset = () => {
    setSeed(MAP_CONTROLS.seed);
    setVersionId(MAP_CONTROLS.versionId);
    setDimension(MAP_CONTROLS.dimension);
    setIsLargeBiome(MAP_CONTROLS.isLargeBiome);
    setCoordinates(MAP_CONTROLS.coordinates);
    setBiomeHeight(MAP_CONTROLS.biomeHeight);
    setStructures(MAP_CONTROLS.structures);
    setBiomes(MAP_CONTROLS.biomes);
  };

  return {
    ...{ seed, setSeed },
    ...{ versionId, setVersionId },
    ...{ dimension, setDimension },
    ...{ isLargeBiome, setIsLargeBiome },
    ...{ coordinates, setCoordinates },
    ...{ biomeHeight, setBiomeHeight },
    ...{ structures, setStructures },
    ...{ biomes, setBiomes },
    values: {
      seed: seedValue,
      versionId,
      dimension,
      isLargeBiome,
      coordinates: coordinatesValue,
      biomeHeight,
      structures,
      biomes,
    },
    reset,
  };
};
