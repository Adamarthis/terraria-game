import { T, TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, SURFACE_HEIGHT } from './constants.js';
import { setNoiseSeed, noise2D, randInt, randFloat, randBool } from './utils.js';
import { TileSystem } from './tile.js';

export class World {
  constructor(seed) {
    this.width = WORLD_WIDTH;
    this.height = WORLD_HEIGHT;
    this.seed = seed || Math.floor(Math.random() * 2147483647);
    this.tiles = new Uint8Array(this.width * this.height);
    this.walls = new Uint8Array(this.width * this.height);
    this.tileSystem = new TileSystem(this);
    this.spawnX = 0;
    this.spawnY = 0;
    this.chestContents = []; // array of { col, row, items: [{ id, count }] }
  }

  generate() {
    setNoiseSeed(this.seed);
    this.generateTerrain();
    this.generateBiomes();
    this.generateCaves();
    this.generateOres();
    this.generateTrees();
    this.generateUnderworld();
    this.generateStructures();
    this.setSpawn();
  }

  generateTerrain() {
    // Generate heightmap using noise
    const heights = new Array(this.width);
    const scale = 0.003;
    const amplitude = 100;

    for (let col = 0; col < this.width; col++) {
      let height = SURFACE_HEIGHT;
      // Main terrain shape
      height += noise2D(col * scale, 0) * amplitude;
      // Add variation
      height += noise2D(col * scale * 3, 1000) * 20;
      height += noise2D(col * scale * 6, 2000) * 8;
      heights[col] = Math.floor(height);
    }

    // Fill tiles
    for (let col = 0; col < this.width; col++) {
      const surfaceRow = heights[col];

      for (let row = 0; row < this.height; row++) {
        let tile = T.AIR;

        if (row < surfaceRow - 2) {
          tile = T.AIR;
        } else if (row === surfaceRow - 2 || row === surfaceRow - 1) {
          tile = T.GRASS;
        } else if (row < surfaceRow + 60) {
          tile = T.DIRT;
        } else if (row < this.height - 250) {
          tile = T.STONE;
        } else {
          // Underworld area
          tile = T.STONE;
        }

        this.tiles[row * this.width + col] = tile;
      }
    }

    // Store for spawn
    this.surfaceHeights = heights;
  }

  generateBiomes() {
    const scale = 0.0008;
    for (let col = 0; col < this.width; col++) {
      const biomeVal = noise2D(col * scale + 5000, 5000);
      const surfaceRow = this.getSurfaceRow(col);

      // Desert
      if (biomeVal > 0.6) {
        for (let row = surfaceRow - 2; row < surfaceRow + 15 && row < this.height; row++) {
          if (this.tiles[row * this.width + col] === T.DIRT || this.tiles[row * this.width + col] === T.GRASS) {
            this.tiles[row * this.width + col] = T.SAND;
          }
        }
        if (surfaceRow > 2) this.tiles[(surfaceRow - 2) * this.width + col] = T.SAND;
      }
      // Snow
      else if (biomeVal < -0.6) {
        for (let row = surfaceRow - 2; row < surfaceRow + 20 && row < this.height; row++) {
          if (this.tiles[row * this.width + col] === T.DIRT || this.tiles[row * this.width + col] === T.GRASS) {
            this.tiles[row * this.width + col] = T.SNOW_BLOCK;
          }
        }
        for (let row = surfaceRow - 5; row < surfaceRow - 2 && row >= 0; row++) {
          this.tiles[row * this.width + col] = T.SNOW;
        }
      }
      // Jungle
      else if (biomeVal > 0.3 && biomeVal <= 0.6) {
        for (let row = surfaceRow; row < surfaceRow + 30 && row < this.height; row++) {
          if (this.tiles[row * this.width + col] === T.DIRT || this.tiles[row * this.width + col] === T.STONE) {
            this.tiles[row * this.width + col] = T.MUD;
          }
        }
        if (surfaceRow > 0) {
          this.tiles[(surfaceRow - 1) * this.width + col] = T.JUNGLE_GRASS;
        }
      }
      // Corruption
      else if (biomeVal < -0.3 && biomeVal >= -0.6) {
        for (let row = surfaceRow - 2; row < surfaceRow + 40 && row < this.height; row++) {
          if (this.tiles[row * this.width + col] === T.STONE) {
            this.tiles[row * this.width + col] = T.EBONSTONE;
          } else if (this.tiles[row * this.width + col] === T.DIRT || this.tiles[row * this.width + col] === T.GRASS) {
            this.tiles[row * this.width + col] = T.EBONSTONE;
          }
        }
        if (surfaceRow > 0) {
          this.tiles[(surfaceRow - 1) * this.width + col] = T.PURPLE_GRASS;
        }
      }
    }
  }

  generateCaves() {
    const caveScale = 0.008;
    const caveScale2 = 0.015;

    for (let col = 0; col < this.width; col++) {
      for (let row = 5; row < this.height - 250; row++) {
        const caveNoise = noise2D(col * caveScale, row * caveScale) * 0.5 +
                          noise2D(col * caveScale2 + 300, row * caveScale2 + 300) * 0.3;
        const idx = row * this.width + col;
        const tile = this.tiles[idx];

        if (tile !== T.AIR && caveNoise > 0.3) {
          this.tiles[idx] = T.AIR;
        }
      }
    }
  }

  generateOres() {
    const oreConfigs = [
      { id: T.COPPER_ORE, scale: 0.04, threshold: 0.55, minRow: 15, maxRow: this.height - 300, clusterSize: 8 },
      { id: T.IRON_ORE, scale: 0.04, threshold: 0.6, minRow: 30, maxRow: this.height - 280, clusterSize: 6 },
      { id: T.SILVER_ORE, scale: 0.04, threshold: 0.65, minRow: 60, maxRow: this.height - 260, clusterSize: 5 },
      { id: T.GOLD_ORE, scale: 0.04, threshold: 0.68, minRow: 100, maxRow: this.height - 250, clusterSize: 4 },
      { id: T.DEMONITE_ORE, scale: 0.03, threshold: 0.7, minRow: 100, maxRow: this.height - 250, clusterSize: 3 },
    ];

    for (let col = 0; col < this.width; col++) {
      for (let row = 0; row < this.height; row++) {
        const idx = row * this.width + col;
        if (this.tiles[idx] !== T.STONE && this.tiles[idx] !== T.EBONSTONE) continue;

        for (const config of oreConfigs) {
          if (row < config.minRow || row > config.maxRow) continue;
          const val = noise2D(col * config.scale + this.seed, row * config.scale + this.seed * 2);
          if (val > config.threshold) {
            this.tiles[idx] = config.id;

            // Spread to neighbors for vein effect
            const spreadCount = randInt(1, config.clusterSize);
            for (let s = 0; s < spreadCount; s++) {
              const dc = randInt(-1, 1);
              const dr = randInt(-1, 1);
              const nidx = (row + dr) * this.width + (col + dc);
              if (nidx >= 0 && nidx < this.tiles.length &&
                  (this.tiles[nidx] === T.STONE || this.tiles[nidx] === T.EBONSTONE)) {
                this.tiles[nidx] = config.id;
              }
            }
            break;
          }
        }
      }
    }
  }

  generateTrees() {
    const treeScale = 0.002;
    for (let col = 3; col < this.width - 3; col++) {
      const surfaceRow = this.getSurfaceRow(col);
      if (surfaceRow <= 2) continue;

      // Only on grassy areas
      const tile = this.tiles[(surfaceRow - 1) * this.width + col];
      if (tile !== T.GRASS && tile !== T.JUNGLE_GRASS) continue;

      const val = noise2D(col * treeScale + 1000, 1000);
      if (val > 0.5) {
        // Check biome for tree type
        const isSnow = this.tiles[(surfaceRow) * this.width + col] === T.SNOW_BLOCK;
        const isSand = this.tiles[(surfaceRow) * this.width + col] === T.SAND;
        const isJungle = tile === T.JUNGLE_GRASS;

        if (isSand) {
          // Cactus in desert
          const cactusHeight = randInt(3, 5);
          for (let r = surfaceRow - 2; r > surfaceRow - 2 - cactusHeight && r >= 0; r--) {
            this.tiles[r * this.width + col] = T.CACTUS;
          }
        } else {
          const trunkHeight = randInt(4, 8);
          for (let r = surfaceRow - 1; r > surfaceRow - 1 - trunkHeight && r >= 0; r--) {
            this.tiles[r * this.width + col] = T.WOOD;
          }
          // Leaves
          const leafTop = surfaceRow - 1 - trunkHeight;
          for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 1; dy++) {
              const leafRow = leafTop + dy;
              const leafCol = col + dx;
              if (leafRow >= 0 && leafCol >= 0 && leafCol < this.width) {
                const idx = leafRow * this.width + leafCol;
                if (this.tiles[idx] === T.AIR && (dx !== 0 || dy !== 0)) {
                  if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
                    if (randBool(0.5)) this.tiles[idx] = T.LEAF;
                  } else {
                    this.tiles[idx] = T.LEAF;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  generateUnderworld() {
    const underworldStart = this.height - 250;

    for (let col = 0; col < this.width; col++) {
      for (let row = underworldStart; row < this.height; row++) {
        const idx = row * this.width + col;
        this.tiles[idx] = T.ASH;

        // Lava pools
        const lavaNoise = noise2D(col * 0.02, row * 0.02);
        if (lavaNoise > 0.4) {
          this.tiles[idx] = T.LAVA;
        }

        // Hellstone veins
        if (row > underworldStart + 50) {
          const hsNoise = noise2D(col * 0.03 + 500, row * 0.03 + 500);
          if (hsNoise > 0.6 && this.tiles[idx] === T.ASH) {
            this.tiles[idx] = T.HELLSTONE;
          }
        }
      }
    }
  }

  generateStructures() {
    // Generate underground cabins
    const cabinCount = randInt(5, 15);
    for (let c = 0; c < cabinCount; c++) {
      const col = randInt(100, this.width - 100);
      const row = randInt(100, this.height - 350);
      this.makeRoom(col, row, randInt(5, 9), randInt(4, 6));
    }
  }

  makeRoom(col, row, w, h) {
    // Simple rectangular room with chest
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const idx = (row + dy) * this.width + (col + dx);
        this.tiles[idx] = T.AIR;
        this.walls[idx] = 1; // background wall
      }
    }
    // Place chest
    const chestCol = col + 1;
    const chestRow = row + 1;
    this.tiles[chestRow * this.width + chestCol] = T.CHEST;

    // Add some items to chest
    this.chestContents.push({
      col: chestCol,
      row: chestRow,
      items: [
        { id: 100 + randInt(0, 5), count: 1 }, // random pickaxe
        { id: 180 + randInt(0, 2), count: randInt(1, 3) }, // potions
        { id: 7 + randInt(0, 3), count: randInt(10, 30) }, // ores
      ]
    });
  }

  setSpawn() {
    // Find center of world, spawn on surface
    const centerCol = Math.floor(this.width / 2);
    const surfaceRow = this.getSurfaceRow(centerCol);
    this.spawnX = centerCol * TILE_SIZE;
    this.spawnY = (surfaceRow - 4) * TILE_SIZE;
  }

  getSurfaceRow(col) {
    for (let row = 1; row < this.height; row++) {
      if (this.tiles[row * this.width + col] !== T.AIR) {
        return row;
      }
    }
    return SURFACE_HEIGHT;
  }

  isUnderground(row) {
    return row > SURFACE_HEIGHT + 50;
  }

  isUnderworld(row) {
    return row > this.height - 300;
  }
}