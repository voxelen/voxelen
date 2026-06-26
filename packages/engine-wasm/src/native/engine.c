#include <emscripten.h>
#include <stdint.h>

#include "generator.h"

static struct {
  int ready;
  int version;
  int dimension;
  uint64_t seed;
  uint32_t flags;
  Generator gen;
} cache;

static void prepare(int version, int dimension, uint64_t seed, uint32_t flags) {
  if (cache.ready && cache.version == version && cache.dimension == dimension && cache.seed == seed && cache.flags == flags) {
    return;
  }

  setupGenerator(&cache.gen, version, flags);
  applySeed(&cache.gen, dimension, seed);

  cache.version = version;
  cache.dimension = dimension;
  cache.seed = seed;
  cache.flags = flags;
  cache.ready = 1;
}

EMSCRIPTEN_KEEPALIVE
int get_biome_at(
  int version,
  int dimension,
  uint32_t seed_hi,
  uint32_t seed_lo,
  uint32_t flags,
  int x,
  int y,
  int z
) {
  const uint64_t seed = ((uint64_t)seed_hi << 32) | seed_lo;

  prepare(version, dimension, seed, flags);

  return getBiomeAt(&cache.gen, 1, x, y, z) & 0xffff;
}
