import { ITEMS, TILE_SIZE } from './constants.js';
import { dist, genId } from './utils.js';

export class Projectile {
  constructor(x, y, vx, vy, damage, owner, props = {}) {
    this.id = genId();
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.owner = owner; // 'player' or 'enemy' or 'boss'
    this.lifetime = props.lifetime || 120;
    this.piercing = props.piercing || 0;
    this.width = props.width || 6;
    this.height = props.height || 6;
    this.alive = true;
    this.hitEntities = new Set();
    this.isPlayerProjectile = props.isPlayerProjectile !== undefined ? props.isPlayerProjectile : true;
    this.color = props.color || '#FFD700';
    this.gravity = props.gravity || 0;
    this.age = 0;
  }

  update(dt) {
    const dtFactor = dt * 60;
    this.age += dtFactor;

    if (this.age >= this.lifetime) {
      this.alive = false;
      return;
    }

    this.vy += this.gravity * dtFactor;
    this.x += this.vx * dtFactor;
    this.y += this.vy * dtFactor;
  }

  get aabb() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  render(ctx, camera) {
    const sp = camera.worldToScreen(this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.fillRect(sp.x, sp.y, this.width, this.height);

    // Glow effect
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.fillRect(sp.x, sp.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }
}

export class CombatSystem {
  constructor() {
    this.projectiles = [];
  }

  fireProjectile(x, y, vx, vy, damage, owner, props = {}) {
    const p = new Projectile(x, y, vx, vy, damage, owner, props);
    this.projectiles.push(p);
    return p;
  }

  update(dt, entities, tileSystem) {
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);

      // Check tile collision
      if (tileSystem) {
        const tileCol = Math.floor(p.x / TILE_SIZE);
        const tileRow = Math.floor(p.y / TILE_SIZE);
        if (tileSystem.isSolid(tileCol, tileRow)) {
          p.alive = false;
        }
      }

      // Check entity collision
      for (const entity of entities) {
        if (!entity.alive) continue;
        if (p.hitEntities.has(entity.id)) continue;

        if (this.checkCollision(p, entity)) {
          entity.takeDamage(p.damage, p.vx * 0.5, -2);
          p.hitEntities.add(entity.id);
          if (p.piercing <= 0) {
            p.alive = false;
          } else {
            p.piercing--;
          }
          break;
        }
      }

      if (!p.alive) {
        this.projectiles.splice(i, 1);
      }
    }

    // Inter-entity combat (enemies vs player)
    for (const entity of entities) {
      if (!entity.alive || !entity.enemyAI) continue; // skip non-enemy
      if (entity.attackCooldown > 0) {
        entity.attackCooldown -= dt * 60;
      }
    }
  }

  checkCollision(projectile, entity) {
    return projectile.x < entity.x + entity.width &&
           projectile.x + projectile.width > entity.x &&
           projectile.y < entity.y + entity.height &&
           projectile.y + projectile.height > entity.y;
  }

  // Melee hit check - arc in front of player
  meleeHitCheck(player, target) {
    const reach = 30;
    const checkX = player.facingRight ? player.x + player.width : player.x - reach;
    const hitbox = {
      x: player.facingRight ? player.right : player.x - reach,
      y: player.y,
      w: reach,
      h: player.height
    };

    return target.x < hitbox.x + hitbox.w &&
           target.x + target.width > hitbox.x &&
           target.y < hitbox.y + hitbox.h &&
           target.y + target.height > hitbox.y;
  }

  clear() {
    this.projectiles = [];
  }
}