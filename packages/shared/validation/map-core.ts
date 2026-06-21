import { z } from "zod";

// ===== Shared Types =====
export type Coord = z.infer<typeof coordSchema>;
export const coordSchema = z.object({
  x: z.number().int(),
  z: z.number().int(),
});

export type CommonSearchContext = z.infer<typeof commonSearchContextSchema>;
export const commonSearchContextSchema = z.object({
  seed: z.union([z.string().min(1), z.number().int(), z.bigint()]),
  versionId: z.union([z.number().int().positive(), z.string().min(1)]),
  dimension: z.enum(["overworld", "nether", "end"]).default("overworld"),
  biomeHeight: z.number().int().default(63),
  origin: coordSchema.default({ x: 0, z: 0 }),
  isLargeBiome: z.boolean().default(false),
});

export type TargetInfo = z.infer<typeof targetInfoSchema>;
export const targetInfoSchema = z.object({
  targetId: z.number().int().nonnegative(),
  recommendedZoom: z.number().positive(),
  distance: z.number().nonnegative(),
  coord: coordSchema.extend({ y: z.number().int().optional() }),
  attributes: z.array(z.object({ key: z.string().min(1), value: z.string() })).default([]),
});

// ===== Finder Types =====
export type FinderType = z.infer<typeof finderTypeSchema>;
export const finderTypeSchema = z.enum(["biome", "structure"]);

export type FinderRequest = z.infer<typeof finderRequestSchema>;
export const finderRequestSchema = commonSearchContextSchema.extend({
  finderType: finderTypeSchema,
  targetId: z.number().int().nonnegative(),
  radius: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1),
});

export type FinderResponse = z.infer<typeof finderResponseSchema>;
export const finderResponseSchema = z.object({
  finderType: finderTypeSchema,
  targetId: z.number().int().nonnegative(),
  context: commonSearchContextSchema,
  targets: z.array(targetInfoSchema),
  meta: z.object({
    searchTime: z.number().nonnegative(),
    totalResults: z.number().int().nonnegative(),
    totalPages: z.number().int().min(1),
    limit: z.number().int().min(1),
    page: z.number().int().min(1),
  }),
});

// ===== Map Types =====
export type MapRequest = z.infer<typeof mapRequestSchema>;
export const mapRequestSchema = commonSearchContextSchema.extend({
  highlightedBiomes: z.array(z.number().int().nonnegative()).default([]),
  enabledStructures: z.array(z.number().int().nonnegative()).default([]),
  view: z.object({
    zoom: z.number().positive(),
    viewportWidth: z.number().int().positive(),
    viewportHeight: z.number().int().positive(),
    center: coordSchema,
  }),
});

export type MapResponse = z.infer<typeof mapResponseSchema>;
export const mapResponseSchema = z.object({
  context: commonSearchContextSchema,
  visibleBiomes: z.array(targetInfoSchema).optional(),
  visibleStructures: z.record(z.string().min(1), z.array(targetInfoSchema)),
  meta: z.object({
    searchTime: z.number().nonnegative(),
    bounds: z.object({
      minX: z.number().int(),
      minZ: z.number().int(),
      maxX: z.number().int(),
      maxZ: z.number().int(),
    }),
  }),
});
