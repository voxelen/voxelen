#include <emscripten.h>
#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <math.h>

#include "generator.h"
#include "finders.h"
#include "biomes.h"
#include "util.h"

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

// Strongholds use initFirstStronghold/nextStronghold — not getStructurePos.
// locateBiome inside nextStronghold is expensive; for coords-only search we
// skip it on 1.19.3+ (approximate position is ±112 blocks).
static int stronghold_in_radius(Pos p, int cx, int cz, long long r2) {
  long long dx = (long long)p.x - cx;
  long long dz = (long long)p.z - cz;
  return dx * dx + dz * dz <= r2;
}

static int stronghold_in_rect(Pos p, int x1, int z1, int x2, int z2) {
  return p.x >= x1 && p.x <= x2 && p.z >= z1 && p.z <= z2;
}

static int collect_strongholds_in_radius(
  Pos* out, int nmax, int version, uint64_t seed,
  int cx, int cz, long long r2
) {
  StrongholdIter sh;
  initFirstStronghold(&sh, version, seed & MASK48);
  const int use_approx = version > MC_1_19_2;

  int total = 0;
  for (;;) {
    int remaining = nextStronghold(&sh, use_approx ? NULL : &cache.gen);
    if (stronghold_in_radius(sh.pos, cx, cz, r2) && total < nmax)
      out[total++] = sh.pos;
    if (remaining <= 0)
      break;
  }
  return total;
}

static int collect_strongholds_in_rect(
  Pos* out, int nmax, int version, uint64_t seed,
  int x1, int z1, int x2, int z2
) {
  StrongholdIter sh;
  initFirstStronghold(&sh, version, seed & MASK48);
  const int use_approx = version > MC_1_19_2;

  int total = 0;
  for (;;) {
    int remaining = nextStronghold(&sh, use_approx ? NULL : &cache.gen);
    if (stronghold_in_rect(sh.pos, x1, z1, x2, z2) && total < nmax)
      out[total++] = sh.pos;
    if (remaining <= 0)
      break;
  }
  return total;
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

    if (stype == Stronghold) {
      if (dimension != 0) continue;

      Pos sh_buf[128];
      int n = collect_strongholds_in_rect(sh_buf, 128, version, seed, x1, z1, x2, z2);
      for (int i = 0; i < n && count < max_markers; i++) {
        buf[1 + count * 3 + 0] = sh_buf[i].x;
        buf[1 + count * 3 + 1] = sh_buf[i].z;
        buf[1 + count * 3 + 2] = stype;
        count++;
      }
      continue;
    }

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

static char detail_buf[4096];

static void append_structure_detail(
  int version, int target_id, int x, int z, char* out, int size
) {
  int biome = getBiomeAt(&cache.gen, 1, x, 64, z) & 0xffff;

  StructureVariant sv;
  memset(&sv, 0, sizeof(sv));
  getVariant(&sv, target_id, version, cache.seed, x, z, biome);

  switch (target_id) {
    case Village: {
      const char* type = "plains";
      switch (sv.biome) {
        case desert:       type = "desert";  break;
        case savanna:      type = "savanna"; break;
        case taiga:        type = "taiga";   break;
        case snowy_plains: type = "snowy";   break;
        case meadow:       type = "meadow";  break;
        default: break;
      }
      snprintf(out, size, "type=%s:zombie=%s", type, sv.abandoned ? "true" : "false");
      break;
    }

    case Igloo: {
      snprintf(out, size, "basement=%s:middle_pieces=%d",
        sv.basement ? "true" : "false", sv.size);
      break;
    }

    case Ruined_Portal:
    case Ruined_Portal_N: {
      snprintf(out, size, "giant=%s:underground=%s:airpocket=%s",
        sv.giant       ? "true" : "false",
        sv.underground ? "true" : "false",
        sv.airpocket   ? "true" : "false");
      break;
    }

    case Bastion: {
      const char* type = "unknown";
      switch (sv.start) {
        case 0: type = "bridge";        break;
        case 1: type = "hoglin_stable"; break;
        case 2: type = "treasure";      break;
        case 3: type = "housing";       break;
        default: break;
      }
      snprintf(out, size, "type=%s", type);
      break;
    }

    case Fortress: {
      const int nmax = 512;
      Piece* pieces = (Piece*)malloc(nmax * sizeof(Piece));
      if (pieces) {
        int n = getFortressPieces(pieces, nmax, version, cache.seed, x >> 4, z >> 4);
        int spawners = 0, wart = 0;
        for (int i = 0; i < n; i++) {
          if (pieces[i].type == BRIDGE_SPAWNER)       spawners++;
          if (pieces[i].type == CORRIDOR_NETHER_WART) wart++;
        }
        snprintf(out, size, "spawners=%d:nether_wart=%d", spawners, wart);
        free(pieces);
      }
      break;
    }

    case End_City: {
      Piece* pieces = (Piece*)malloc(END_CITY_PIECES_MAX * sizeof(Piece));
      if (pieces) {
        int n = getEndCityPieces(pieces, cache.seed, x >> 4, z >> 4);
        int ship = 0;
        for (int i = 0; i < n; i++) {
          if (pieces[i].type == END_SHIP) { ship = 1; break; }
        }
        snprintf(out, size, "ship=%s", ship ? "true" : "false");
        free(pieces);
      }
      break;
    }

    default: {
      const char* bname = biome2str(version, biome);
      snprintf(out, size, "biome=%s", bname ? bname : "unknown");
      break;
    }
  }
}

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

  // buffer: [total, collected, detail_ptr, x0, z0, id0, ...]
  int32_t* buf = (int32_t*)malloc((3 + limit * 3) * sizeof(int32_t));
  if (!buf) return NULL;

  int total     = 0;
  int collected = 0;
  int detail_pos = 0;
  detail_buf[0] = '\0';

  if (target_type == 0) {
    int s = 4; // scale = 16

    Range r;
    r.scale = 16;
    r.x     = (cx - radius) >> s;
    r.z     = (cz - radius) >> s;
    r.sx    = (radius * 2)  >> s;
    r.sz    = (radius * 2)  >> s;
    r.y     = cy >> s;
    r.sy    = 1;

    int nmax     = 4096;
    Pos* centers = (Pos*)malloc(nmax * sizeof(Pos));
    int* sizes   = (int*)malloc(nmax * sizeof(int));
    if (!centers || !sizes) {
      free(centers); free(sizes); free(buf);
      return NULL;
    }

    int n = getBiomeCenters(centers, sizes, nmax, &cache.gen, r, target_id, 1, 4, NULL);

    // sort by distance from (cx, cz)
    for (int i = 1; i < n; i++) {
      Pos pc = centers[i];
      int ps = sizes[i];
      long long di = (long long)(pc.x-cx)*(pc.x-cx) + (long long)(pc.z-cz)*(pc.z-cz);
      int j = i - 1;
      while (j >= 0) {
        long long dj = (long long)(centers[j].x-cx)*(centers[j].x-cx)
                     + (long long)(centers[j].z-cz)*(centers[j].z-cz);
        if (dj <= di) break;
        centers[j+1] = centers[j];
        sizes[j+1]   = sizes[j];
        j--;
      }
      centers[j+1] = pc;
      sizes[j+1]   = ps;
    }

    total = n;
    int skip = (page - 1) * limit;
    int end = skip + limit < n ? skip + limit : n;
    for (int i = skip; i < end; i++) {
      buf[3 + collected * 3 + 0] = centers[i].x;
      buf[3 + collected * 3 + 1] = centers[i].z;
      buf[3 + collected * 3 + 2] = target_id;

      if (collected > 0 && detail_pos < (int)sizeof(detail_buf) - 1)
        detail_buf[detail_pos++] = '|';
      int written = snprintf(detail_buf + detail_pos,
        sizeof(detail_buf) - detail_pos, "biome=%d", target_id);
      if (written > 0) detail_pos += written;

      collected++;
    }

    free(centers);
    free(sizes);

  } else {
    // Structure search — paginated, sorted by distance.
    long long r2 = (long long)radius * radius;

    int nmax   = 4096;
    Pos* found = (Pos*)malloc(nmax * sizeof(Pos));
    if (!found) { free(buf); return NULL; }

    if (target_id == Stronghold) {
      if (dimension == 0)
        total = collect_strongholds_in_radius(found, nmax, version, seed, cx, cz, r2);
    } else {
      StructureConfig sc;
      if (!getStructureConfig(target_id, version, &sc)) {
        buf[0] = 0; buf[1] = 0; buf[2] = 0;
        free(found);
        return buf;
      }

      int region_blocks = sc.regionSize * 16;
      int reg_cx        = cx / region_blocks;
      int reg_cz        = cz / region_blocks;
      int max_reg       = radius / region_blocks + 2;
      int total_regions = (2 * max_reg + 1) * (2 * max_reg + 1);

      Spiral s;
      spiral_init(&s);

      for (int i = 0; i < total_regions; i++) {
        int rx = reg_cx + s.pos.x;
        int rz = reg_cz + s.pos.z;

        Pos pos;
        if (total < nmax && getStructurePos(target_id, version, seed, rx, rz, &pos)) {
          long long dx = pos.x - cx, dz = pos.z - cz;
          if (dx*dx + dz*dz <= r2 && isViableStructurePos(target_id, &cache.gen, pos.x, pos.z, flags)) {
            found[total++] = pos;
          }
        }

        if (i < total_regions - 1) spiral_next(&s);
      }
    }

    // sort by distance from (cx, cz)
    for (int i = 1; i < total; i++) {
      Pos pc = found[i];
      long long di = (long long)(pc.x - cx) * (pc.x - cx) + (long long)(pc.z - cz) * (pc.z - cz);
      int j = i - 1;
      while (j >= 0) {
        long long dj = (long long)(found[j].x - cx) * (found[j].x - cx)
                     + (long long)(found[j].z - cz) * (found[j].z - cz);
        if (dj <= di) break;
        found[j + 1] = found[j];
        j--;
      }
      found[j + 1] = pc;
    }

    int skip = (page - 1) * limit;
    int end  = skip + limit < total ? skip + limit : total;
    for (int i = skip; i < end; i++) {
      buf[3 + collected * 3 + 0] = found[i].x;
      buf[3 + collected * 3 + 1] = found[i].z;
      buf[3 + collected * 3 + 2] = target_id;

      char tmp[256];
      tmp[0] = '\0';
      append_structure_detail(version, target_id, found[i].x, found[i].z, tmp, sizeof(tmp));
      if (collected > 0 && detail_pos < (int)sizeof(detail_buf) - 1)
        detail_buf[detail_pos++] = '|';
      int written = snprintf(detail_buf + detail_pos,
        sizeof(detail_buf) - detail_pos, "%s", tmp);
      if (written > 0) detail_pos += written;

      collected++;
    }

    free(found);
  }

  buf[0] = total;
  buf[1] = collected;
  buf[2] = (int32_t)(uintptr_t)detail_buf;
  return buf;
}

EMSCRIPTEN_KEEPALIVE
void free_buffer(void* ptr) {
  free(ptr);
}