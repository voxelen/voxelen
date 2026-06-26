import { MAP_CORE } from "@repo/shared/constants";
import { atomWithStorage } from "jotai/utils";

export const seedAtom = atomWithStorage("map-seed", MAP_CORE.seed);
export const versionIdAtom = atomWithStorage("map-version", MAP_CORE.versionId);
export const dimensionAtom = atomWithStorage("map-dimension", MAP_CORE.dimension);
export const isLargeBiomeAtom = atomWithStorage("map-is-large-biome", MAP_CORE.isLargeBiome);
export const coordinatesAtom = atomWithStorage("map-coordinates", MAP_CORE.coordinates);
export const biomeHeightAtom = atomWithStorage("map-biome-height", MAP_CORE.biomeHeight);
export const structuresAtom = atomWithStorage<number[]>("map-structures", MAP_CORE.structures);
export const biomesAtom = atomWithStorage<number[]>("map-biomes", MAP_CORE.biomes);
