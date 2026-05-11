import { T, TILE_SIZE, TILE_PROPS, TILE_COLORS } from './constants.js';

export class TileSystem {
  constructor(world) {
    this.world = world;
    // Damage tracking for partial mining
    this.tileDamage = new Map(); // key: "col,row" -> damage amount
  }

  getTile(col, row) {
    if (col < 0 || col >= this.world.width || row < 0 || row >= this.world.height) {
      return T.STONE; // World border = stone
    }
    return this.world.tiles[row * this.world.width + col];
  }

  getWall(col, row) {
    if (col < 0 || col >= this.world.width || row < 0 || row >= this.world.height) {
      return T.AIR;
    }
    if (!this.world.walls) return T.AIR;
    return this.world.walls[row * this.world.width + col];
  }

  setTile(col, row, tileId) {
    if (col < 0 || col >= this.world.width || row < 0 || row >= this.world.height) return;
    this.world.tiles[row * this.world.width + col] = tileId;
    this.tileDamage.delete(`${col},${row}`);
  }

  setWall(col, row, wallId) {
    if (col < 0 || col >= this.world.width || row < 0 || row >= this.world.height) return;
    if (!this.world.walls) return;
    this.world.walls[row * this.world.width + col] = wallId;
  }

  isSolid(col, row) {
    const id = this.getTile(col, row);
    if (id === T.AIR) return false;
    if (id === T.WATER || id === T.LAVA) return false;
    if (id === T.PLATFORM) return false; // one-way
    if (id === T.TORCH) return false;
    return true;
  }

  isPlatform(col, row) {
    return this.getTile(col, row) === T.PLATFORM;
  }

  getHardness(col, row) {
    const id = this.getTile(col, row);
    const props = TILE_PROPS[id];
    return props ? props.hardness : 0;
  }

  getDrops(col, row) {
    const id = this.getTile(col, row);
    const props = TILE_PROPS[id];
    return props ? props.drops : [];
  }

  getTileColor(col, row) {
    const id = this.getTile(col, row);
    return TILE_COLORS[id] || '#000';
  }

  getTileName(col, row) {
    const id = this.getTile(col, row);
    const props = TILE_PROPS[id];
    return props ? props.name : 'Unknown';
  }

  getProps(col, row) {
    const id = this.getTile(col, row);
    return TILE_PROPS[id] || {};
  }

  addDamage(col, row, amount) {
    const key = `${col},${row}`;
    const current = this.tileDamage.get(key) || 0;
    const newDamage = current + amount;
    const hardness = this.getHardness(col, row);
    this.tileDamage.set(key, newDamage);
    return newDamage >= hardness;
  }

  getDamage(col, row) {
    return this.tileDamage.get(`${col},${row}`) || 0;
  }

  getDamagePercent(col, row) {
    const hardness = this.getHardness(col, row);
    if (hardness <= 0) return 0;
    return this.getDamage(col, row) / hardness;
  }

  isLiquid(col, row) {
    const id = this.getTile(col, row);
    return id === T.WATER || id === T.LAVA;
  }

  hasCraftingStation(col, row, type) {
    const id = this.getTile(col, row);
    const props = TILE_PROPS[id];
    return props && props.craftingStation === type;
  }

  isContainer(col, row) {
    const props = this.getProps(col, row);
    return props.container === true;
  }

  // Check if a tile is passable (for entity movement)
  isPassable(col, row, entityIsPlayer = false) {
    const id = this.getTile(col, row);
    if (id === T.AIR || id === T.PLATFORM || id === T.WATER || id === T.LAVA) return true;
    if (id === T.TORCH) return true;
    return false;
  }

  // Get tile at world pixel position
  tileAtWorld(wx, wy) {
    const col = Math.floor(wx / TILE_SIZE);
    const row = Math.floor(wy / TILE_SIZE);
    return { col, row, id: this.getTile(col, row) };
  }

  render(ctx, camera) {
    const { startCol, startRow, endCol, endRow } = camera.visibleTiles;
    const tileSize = TILE_SIZE;

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const id = this.getTile(col, row);
        if (id === T.AIR) continue;

        const screenPos = camera.worldToScreen(col * tileSize, row * tileSize);
        const color = TILE_COLORS[id];

        if (!color) continue;

        ctx.fillStyle = color;
        ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);

        // Special rendering for ores - add speckles
        if (id >= T.COPPER_ORE && id <= T.GOLD_ORE) {
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(screenPos.x + 3, screenPos.y + 3, 4, 4);
          ctx.fillRect(screenPos.x + 9, screenPos.y + 9, 4, 4);
        }

        // Torch light indicator
        if (id === T.TORCH) {
          ctx.fillStyle = '#FFA500';
          ctx.fillRect(screenPos.x + 6, screenPos.y + 2, 4, 10);
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(screenPos.x + 8, screenPos.y + 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Chest rendering
        if (id === T.CHEST) {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenPos.x + 2, screenPos.y + 2, 12, 12);
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(screenPos.x + 6, screenPos.y + 6, 4, 4);
        }

        // Damage cracks
        const dmg = this.getDamagePercent(col, row);
        if (dmg > 0 && dmg < 1) {
          ctx.strokeStyle = `rgba(0,0,0,${dmg * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y);
          ctx.lineTo(screenPos.x + tileSize * dmg, screenPos.y + tileSize * dmg);
          ctx.moveTo(screenPos.x + tileSize, screenPos.y);
          ctx.lineTo(screenPos.x + tileSize - tileSize * dmg, screenPos.y + tileSize * dmg);
          ctx.stroke();
        }
      }
    }

    // Render background walls behind tiles
    if (this.world.walls) {
      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const wall = this.getWall(col, row);
          if (wall === T.AIR) continue;
          if (this.getTile(col, row) !== T.AIR) continue; // only show walls on air tiles

          const screenPos = camera.worldToScreen(col * tileSize, row * tileSize);
          ctx.fillStyle = 'rgba(100,100,100,0.3)';
          ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);
        }
      }
    }
  }
}