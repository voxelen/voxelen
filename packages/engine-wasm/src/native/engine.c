#include <emscripten.h>
#include <stdint.h>
#include <stdlib.h>
#include <math.h>

#include "generator.h"
#include "finders.h"

// ===== Generator cache =====

static struct {
  int      ready;
  int      version;
  int      dimension;
  uint64_t seed;
  uint32_t flags;
  Generator gen;
} cache;

static void prepare(int version, int dimension, uint64_t seed, uint32_t flags) {
  if (cache.ready &&
      cache.version == version &&
      cache.dimension == dimension &&
      cache.seed == seed &&
      cache.flags == flags) return;

  setupGenerator(&cache.gen, version, flags);
  applySeed(&cache.gen, dimension, seed);
  cache.version   = version;
  cache.dimension = dimension;
  cache.seed      = seed;
  cache.flags     = flags;
  cache.ready     = 1;
}

static uint64_t unpack_seed(uint32_t hi, uint32_t lo) {
  return ((uint64_t)hi << 32) | lo;
}

// ===== Spiral iterator =====
// Yields (x, z) offsets outward from (0, 0) in a square spiral.

typedef struct { int x; int z; } IVec2;

typedef struct {
  IVec2 pos;
  int dx, dz;
  int step_max, step_cur, turns;
} Spiral;

static void spiral_init(Spiral *s) {
  s->pos = (IVec2){ 0, 0 };
  s->dx = 1; s->dz = 0;
  s->step_max = 1; s->step_cur = 0; s->turns = 0;
}

static void spiral_next(Spiral *s) {
  s->pos.x += s->dx;
  s->pos.z += s->dz;
  if (++s->step_cur == s->step_max) {
    s->step_cur = 0;
    int tmp = s->dx;
    s->dx = -s->dz;
    s->dz = tmp;
    if (++s->turns % 2 == 0) s->step_max++;
  }
}

// ===== Exports =====

EMSCRIPTEN_KEEPALIVE
int get_biome_at(
  int version, int dimension,
  uint32_t seed_hi, uint32_t seed_lo, uint32_t flags,
  int x, int y, int z
) {
  prepare(version, dimension, unpack_seed(seed_hi, seed_lo), flags);
  return getBiomeAt(&cache.gen, 1, x, y, z) & 0xffff;
}

// Returns int32_t* → biome ids, width*height elements, row-major (z outer, x inner).
// x, z: tile origin in block coords.
// width, height: tile size in biome cells (already divided by scale on TS side).
// scale: cubiomes scale (1 / 4 / 16 / 64 / 256).
// y: biome height in block coords.
EMSCRIPTEN_KEEPALIVE
int32_t* render_tile(
  int version, int dimension,
  uint32_t seed_hi, uint32_t seed_lo, uint32_t flags,
  int x, int z, int width, int height, int scale, int y
) {
  prepare(version, dimension, unpack_seed(seed_hi, seed_lo), flags);

  int32_t* buf = (int32_t*)malloc(width * height * sizeof(int32_t));
  if (!buf) return NULL;

  Range r;
  r.scale = scale;
  r.x  = x / scale;
  r.z  = z / scale;
  r.sx = width;
  r.sz = height;
  r.y  = y / scale;
  r.sy = 1;

  genBiomes(&cache.gen, buf, r);
  return buf;
}

// Returns int32_t* → [count, x0, z0, typeId0, x1, z1, typeId1, ...]
// x1,z1,x2,z2: viewport bounds in block coords.
// structure_ids: pointer to int32 array of structure type ids.
EMSCRIPTEN_KEEPALIVE
int32_t* render_markers(
  int version, int dimension,
  uint32_t seed_hi, uint32_t seed_lo, uint32_t flags,
  int x1, int z1, int x2, int z2,
  int32_t* structure_ids, int structure_count
) {
  uint64_t seed = unpack_seed(seed_hi, seed_lo);
  prepare(version, dimension, seed, flags);

  int max_markers = 2048;
  int32_t* buf = (int32_t*)malloc((1 + max_markers * 3) * sizeof(int32_t));
  if (!buf) return NULL;

  int count = 0;

  for (int si = 0; si < structure_count && count < max_markers; si++) {
    int stype = structure_ids[si];

    StructureConfig sc;
    if (!getStructureConfig(stype, version, &sc)) continue;

    int region_blocks = sc.regionSize * 16;
    int rx1 = (int)floor((double)x1 / region_blocks) - 1;
    int rz1 = (int)floor((double)z1 / region_blocks) - 1;
    int rx2 = (int)floor((double)x2 / region_blocks) + 1;
    int rz2 = (int)floor((double)z2 / region_blocks) + 1;

    for (int rz = rz1; rz <= rz2 && count < max_markers; rz++) {
      for (int rx = rx1; rx <= rx2 && count < max_markers; rx++) {
        Pos pos;
        if (!getStructurePos(stype, version, seed, rx, rz, &pos)) continue;
        if (pos.x < x1 || pos.x > x2 || pos.z < z1 || pos.z > z2) continue;
        if (!isViableStructurePos(stype, &cache.gen, pos.x, pos.z, flags)) continue;

        buf[1 + count * 3 + 0] = pos.x;
        buf[1 + count * 3 + 1] = pos.z;
        buf[1 + count * 3 + 2] = stype;
        count++;
      }
    }
  }

  buf[0] = count;
  return buf;
}

// Returns int32_t* → [total, count, x0, z0, targetId0, x1, z1, targetId1, ...]
// target_type: 0 = biome, 1 = structure.
// cy: biome height in block coords (used for biome sampling y level).
EMSCRIPTEN_KEEPALIVE
int32_t* search_targets(
  int version, int dimension,
  uint32_t seed_hi, uint32_t seed_lo, uint32_t flags,
  int cx, int cz, int cy,
  int target_type, int target_id,
  int radius, int limit, int page
) {
  uint64_t seed = unpack_seed(seed_hi, seed_lo);
  prepare(version, dimension, seed, flags);

  int skip        = (page - 1) * limit;
  int max_collect = skip + limit;

  int32_t* buf = (int32_t*)malloc((2 + max_collect * 3) * sizeof(int32_t));
  if (!buf) return NULL;

  int total     = 0;
  int collected = 0;

  if (target_type == 0) {
    // Biome search: spiral in chunk steps (16 blocks per sample).
    int step = 16;
    int max_r = radius / step + 1;
    int total_cells = (2 * max_r + 1) * (2 * max_r + 1);
    long long r2 = (long long)radius * radius;

    Spiral s;
    spiral_init(&s);

    for (int i = 0; i < total_cells; i++) {
      int bx = cx + s.pos.x * step;
      int bz = cz + s.pos.z * step;

      long long dx = bx - cx, dz = bz - cz;
      if (dx*dx + dz*dz <= r2) {
        int biome = getBiomeAt(&cache.gen, 4, bx / 4, cy / 4, bz / 4) & 0xffff;
        if (biome == target_id) {
          total++;
          if (total > skip && collected < limit) {
            buf[2 + collected * 3 + 0] = bx;
            buf[2 + collected * 3 + 1] = bz;
            buf[2 + collected * 3 + 2] = biome;
            collected++;
          }
        }
      }

      if (i < total_cells - 1) spiral_next(&s);
    }

  } else {
    // Structure search: spiral over regions.
    StructureConfig sc;
    if (!getStructureConfig(target_id, version, &sc)) {
      buf[0] = 0; buf[1] = 0;
      return buf;
    }

    int region_blocks = sc.regionSize * 16;
    int reg_cx  = cx / region_blocks;
    int reg_cz  = cz / region_blocks;
    int max_reg = radius / region_blocks + 2;
    int total_regions = (2 * max_reg + 1) * (2 * max_reg + 1);
    long long r2 = (long long)radius * radius;

    Spiral s;
    spiral_init(&s);

    for (int i = 0; i < total_regions; i++) {
      int rx = reg_cx + s.pos.x;
      int rz = reg_cz + s.pos.z;

      Pos pos;
      if (getStructurePos(target_id, version, seed, rx, rz, &pos)) {
        long long dx = pos.x - cx, dz = pos.z - cz;
        if (dx*dx + dz*dz <= r2 && isViableStructurePos(target_id, &cache.gen, pos.x, pos.z, flags)) {
          total++;
          if (total > skip && collected < limit) {
            buf[2 + collected * 3 + 0] = pos.x;
            buf[2 + collected * 3 + 1] = pos.z;
            buf[2 + collected * 3 + 2] = target_id;
            collected++;
          }
        }
      }

      if (i < total_regions - 1) spiral_next(&s);
    }
  }

  buf[0] = total;
  buf[1] = collected;
  return buf;
}

EMSCRIPTEN_KEEPALIVE
void free_buffer(void* ptr) {
  free(ptr);
}