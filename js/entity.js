import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, GRAVITY, COLLISION_TOLERANCE } from './constants.js';
import { clamp, genId } from './utils.js';

export class Entity {
  constructor(x, y, width, height) {
    this.id = genId();
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = width;
    this.height = height;
    this.health = 100;
    this.maxHealth = 100;
    this.defense = 0;
    this.onGround = false;
    this.alive = true;
    this.knockbackResist = 0;
    this.friction = 0.8;
    this.facingRight = true;
  }

  get left() { return this.x; }
  get right() { return this.x + this.width; }
  get top() { return this.y; }
  get bottom() { return this.y + this.height; }
  get centerX() { return this.x + this.width / 2; }
  get centerY() { return this.y + this.height / 2; }

  get aabb() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  takeDamage(amount, knockbackX = 0, knockbackY = 0) {
    const actualDamage = Math.max(1, amount - this.defense);
    this.health -= actualDamage;
    this.vx += knockbackX * (1 - this.knockbackResist);
    this.vy += knockbackY * (1 - this.knockbackResist);
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
    return actualDamage;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  updatePhysics(tileSystem, dt) {
    if (!this.alive) return;

    const dtFactor = dt * 60;

    // Apply gravity
    this.vy += GRAVITY * dtFactor;
    this.vy = clamp(this.vy, -20, 20);

    // Apply velocity
    this.x += this.vx * dtFactor;
    this.y += this.vy * dtFactor;

    // Friction
    if (this.onGround) {
      this.vx *= Math.pow(this.friction, dtFactor);
    } else {
      this.vx *= Math.pow(0.95, dtFactor);
    }

    // Collision resolution
    this.collideWithTiles(tileSystem);

    // Clamp to world
    this.x = clamp(this.x, 0, WORLD_WIDTH * TILE_SIZE - this.width);
    this.y = clamp(this.y, 0, WORLD_HEIGHT * TILE_SIZE - this.height);
  }

  collideWithTiles(tileSystem) {
    this.onGround = false;

    const tileSize = TILE_SIZE;
    const tol = COLLISION_TOLERANCE;

    const checkCorners = (x, y, w, h) => {
      const left = Math.floor(x / tileSize);
      const right = Math.floor((x + w - tol) / tileSize);
      const top = Math.floor(y / tileSize);
      const bottom = Math.floor((y + h - tol) / tileSize);

      for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
          if (tileSystem.isSolid(col, row)) {
            return true;
          }
        }
      }
      return false;
    };

    // Vertical collision
    if (this.vy > 0) {
      const bottomRow = Math.floor((this.y + this.height) / tileSize);
      const leftCol = Math.floor(this.x / tileSize);
      const rightCol = Math.floor((this.x + this.width - tol) / tileSize);

      for (let c = leftCol; c <= rightCol; c++) {
        if (tileSystem.isSolid(c, bottomRow)) {
          this.y = bottomRow * tileSize - this.height;
          this.vy = 0;
          this.onGround = true;
          break;
        }
      }
    } else if (this.vy < 0) {
      const topRow = Math.floor(this.y / tileSize);
      const leftCol = Math.floor(this.x / tileSize);
      const rightCol = Math.floor((this.x + this.width - tol) / tileSize);

      for (let c = leftCol; c <= rightCol; c++) {
        if (tileSystem.isSolid(c, topRow)) {
          this.y = (topRow + 1) * tileSize;
          this.vy = 0;
          break;
        }
      }
    }

    // Horizontal collision
    if (this.vx > 0) {
      const rightCol = Math.floor((this.x + this.width) / tileSize);
      const topRow = Math.floor(this.y / tileSize);
      const bottomRow = Math.floor((this.y + this.height - tol) / tileSize);

      for (let r = topRow; r <= bottomRow; r++) {
        if (tileSystem.isSolid(rightCol, r)) {
          this.x = rightCol * tileSize - this.width;
          this.vx = 0;
          break;
        }
      }
    } else if (this.vx < 0) {
      const leftCol = Math.floor(this.x / tileSize);
      const topRow = Math.floor(this.y / tileSize);
      const bottomRow = Math.floor((this.y + this.height - tol) / tileSize);

      for (let r = topRow; r <= bottomRow; r++) {
        if (tileSystem.isSolid(leftCol, r)) {
          this.x = (leftCol + 1) * tileSize;
          this.vx = 0;
          break;
        }
      }
    }
  }

  overlapsWith(other) {
    return this.x < other.x + other.width && this.x + this.width > other.x &&
           this.y < other.y + other.height && this.y + this.height > other.y;
  }

  distanceTo(other) {
    const dx = this.centerX - other.centerX;
    const dy = this.centerY - other.centerY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}