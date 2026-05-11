import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from './constants.js';
import { clamp, lerp } from './utils.js';

export class Camera {
  constructor(canvasWidth, canvasHeight) {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.width = canvasWidth;
    this.height = canvasHeight;
  }

  setCanvasSize(w, h) {
    this.width = w;
    this.height = h;
  }

  follow(entity) {
    // Center camera on entity
    this.targetX = entity.x - this.width / 2 + entity.width / 2;
    this.targetY = entity.y - this.height / 2 + entity.height / 2;
  }

  update(dt) {
    // Smooth lerp follow
    const smooth = 0.08 * dt * 60;
    this.x = lerp(this.x, this.targetX, smooth);
    this.y = lerp(this.y, this.targetY, smooth);
    this.clamp();
  }

  clamp() {
    this.x = clamp(this.x, 0, WORLD_WIDTH * TILE_SIZE - this.width);
    this.y = clamp(this.y, 0, WORLD_HEIGHT * TILE_SIZE - this.height);
  }

  screenToWorld(sx, sy) {
    return {
      x: sx + this.x,
      y: sy + this.y
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx - this.x,
      y: wy - this.y
    };
  }

  get visibleTiles() {
    const startCol = Math.max(0, Math.floor(this.x / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(this.y / TILE_SIZE));
    const endCol = Math.min(WORLD_WIDTH - 1, Math.ceil((this.x + this.width) / TILE_SIZE) + 1);
    const endRow = Math.min(WORLD_HEIGHT - 1, Math.ceil((this.y + this.height) / TILE_SIZE) + 1);
    return { startCol, startRow, endCol, endRow };
  }

  isVisible(wx, wy) {
    return wx + TILE_SIZE > this.x && wx < this.x + this.width &&
           wy + TILE_SIZE > this.y && wy < this.y + this.height;
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
  }
}