import { useDebouncedValue } from "@mantine/hooks";
import { MAP_CORE } from "@repo/shared/constants";
import { useAtom } from "jotai/react";
import * as store from "../store";

export const useMapState = () => {
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
    setSeed(MAP_CORE.seed);
    setVersionId(MAP_CORE.versionId);
    setDimension(MAP_CORE.dimension);
    setIsLargeBiome(MAP_CORE.isLargeBiome);
    setCoordinates(MAP_CORE.coordinates);
    setBiomeHeight(MAP_CORE.biomeHeight);
    setStructures(MAP_CORE.structures);
    setBiomes(MAP_CORE.biomes);
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
