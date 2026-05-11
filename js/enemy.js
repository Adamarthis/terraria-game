import { Entity } from './entity.js';
import { ENEMY_TYPES, ITEMS, TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, MAX_ENEMIES, ENEMY_SPAWN_INTERVAL } from './constants.js';
import { randInt, randFloat, randBool, dist, genId } from './utils.js';

export class Enemy extends Entity {
  constructor(x, y, type) {
    const def = ENEMY_TYPES[type];
    super(x, y, def.width, def.height);
    this.enemyType = type;
    this.def = def;
    this.maxHealth = def.health;
    this.health = def.health;
    this.damage = def.damage;
    this.defense = def.defense;
    this.knockbackResist = def.knockbackResist;
    this.color = def.color;
    this.attackCooldown = 0;
    this.enemyAI = true;

    // AI state
    this.aiState = 'idle';
    this.aiTimer = 0;
    this.targetX = x;
    this.targetY = y;
    this.moveTimer = 0;
  }

  update(dt, player, tileSystem) {
    if (!this.alive) return;

    const dtFactor = dt * 60;
    const dx = player.centerX - this.centerX;
    const dy = player.centerY - this.centerY;
    const d = dist(this.centerX, this.centerY, player.centerX, player.centerY);

    // Despawn if too far
    if (d > 3000) {
      this.alive = false;
      return;
    }

    // AI behavior based on type
    switch (this.enemyType) {
      case 'slime':
        this.slimeAI(dt, player, dx, dy, d);
        break;
      case 'zombie':
        this.zombieAI(dt, player, dx, dy, d);
        break;
      case 'demonEye':
        this.flyingAI(dt, player, dx, dy, d);
        break;
      case 'eaterOfSouls':
        this.flyingAI(dt, player, dx, dy, d);
        break;
      case 'harpy':
        this.flyingAI(dt, player, dx, dy, d);
        break;
      case 'lavaSlime':
        this.slimeAI(dt, player, dx, dy, d);
        break;
      default:
        this.zombieAI(dt, player, dx, dy, d);
    }

    // Physics
    this.updatePhysics(tileSystem, dt);

    // Face toward player
    this.facingRight = dx > 0;

    // Attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dtFactor;
    }

    // Collision with player
    if (d < 40 && this.attackCooldown <= 0) {
      player.takeDamage(this.damage, Math.sign(dx) * 5, -3);
      this.attackCooldown = 30;
    }

    // Check if in lava
    const tile = tileSystem.tileAtWorld(this.centerX, this.centerY);
    if (tile && tile.id === 24) { // LAVA
      this.takeDamage(1);
    }
  }

  slimeAI(dt, player, dx, dy, d) {
    this.aiTimer -= dt * 60;
    if (this.aiTimer <= 0) {
      if (d < 400) {
        // Hop toward player
        const hopX = Math.sign(dx) * randFloat(1, 3);
        this.vx = hopX;
        if (this.onGround) {
          this.vy = randFloat(-6, -4);
        }
      }
      this.aiTimer = randInt(30, 90);
    }
  }

  zombieAI(dt, player, dx, dy, d) {
    if (d < 500) {
      // Walk toward player
      const speed = randFloat(0.5, 1.5);
      this.vx = Math.sign(dx) * speed;

      // Jump if blocked
      if (this.onGround && Math.abs(this.vx) < 0.1) {
        this.vy = -7;
      }
    } else {
      this.vx *= 0.9;
    }
  }

  flyingAI(dt, player, dx, dy, d) {
    if (d < 600) {
      const speed = randFloat(1.5, 3);
      const targetX = player.centerX;
      const targetY = player.centerY - 20;

      const moveX = targetX - this.centerX;
      const moveY = targetY - this.centerY;
      const moveD = Math.sqrt(moveX * moveX + moveY * moveY);

      if (moveD > 10) {
        this.vx += (moveX / moveD) * 0.3;
        this.vy += (moveY / moveD) * 0.3;
      }

      // Clamp speed
      const speedMag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speedMag > speed) {
        this.vx = (this.vx / speedMag) * speed;
        this.vy = (this.vy / speedMag) * speed;
      }
    }
  }

  render(ctx, camera) {
    if (!this.alive) return;

    const sp = camera.worldToScreen(this.x, this.y);

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(sp.x, sp.y, this.width, this.height);

    // Eyes
    ctx.fillStyle = '#FFF';
    const eyeOffset = this.facingRight ? this.width - 8 : 4;
    ctx.fillRect(sp.x + eyeOffset, sp.y + 4, 5, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(sp.x + eyeOffset + 1, sp.y + 5, 3, 3);

    // Health bar only if damaged
    if (this.health < this.maxHealth) {
      const barW = this.width + 6;
      const barH = 3;
      const barX = sp.x - 3;
      const barY = sp.y - 7;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#E44';
      ctx.fillRect(barX, barY, barW * (this.health / this.maxHealth), barH);
    }
  }
}

export class EnemySpawner {
  constructor(world) {
    this.world = world;
    this.spawnTimer = 0;
    this.enemies = [];
  }

  update(dt, player, tileSystem) {
    const dtFactor = dt * 60;
    this.spawnTimer += dtFactor;

    // Remove dead/despawned enemies
    this.enemies = this.enemies.filter(e => e.alive);

    // Spawn logic
    if (this.enemies.length < MAX_ENEMIES && this.spawnTimer >= ENEMY_SPAWN_INTERVAL) {
      this.spawnTimer = 0;
      this.trySpawn(player, tileSystem);
    }

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, player, tileSystem);
    }
  }

  trySpawn(player, tileSystem) {
    const playerTileCol = Math.floor(player.centerX / TILE_SIZE);
    const playerTileRow = Math.floor(player.centerY / TILE_SIZE);

    // Pick a random direction to spawn
    const angle = randFloat(0, Math.PI * 2);
    const spawnDist = randFloat(600, 900);
    const spawnCol = Math.floor(playerTileCol + Math.cos(angle) * (spawnDist / TILE_SIZE));
    const spawnRow = Math.floor(playerTileRow + Math.sin(angle) * (spawnDist / TILE_SIZE));

    if (spawnCol < 5 || spawnCol >= WORLD_WIDTH - 5 || spawnRow < 5 || spawnRow >= WORLD_HEIGHT - 5) return;

    // Find ground level if spawning in air
    let actualRow = spawnRow;
    for (let r = spawnRow; r < Math.min(spawnRow + 50, WORLD_HEIGHT - 5); r++) {
      if (tileSystem.isSolid(spawnCol, r)) {
        actualRow = r - 1;
        break;
      }
    }

    const spawnX = spawnCol * TILE_SIZE;
    const spawnY = actualRow * TILE_SIZE;

    // Determine enemy type based on depth
    let enemyType;
    const surfaceRow = 200;
    const row = Math.floor(spawnY / TILE_SIZE);

    if (row > this.world.height - 300) {
      enemyType = randBool(0.5) ? 'lavaSlime' : 'boneSerpent';
    } else if (row > surfaceRow + 100) {
      enemyType = randBool() ? 'zombie' : (randBool(0.3) ? 'eaterOfSouls' : 'demonEye');
    } else if (row > surfaceRow + 20) {
      enemyType = randBool() ? 'slime' : 'zombie';
    } else {
      // Surface - only spawn at night or underground
      // For simplicity, always spawn some
      if (randBool(0.3)) {
        enemyType = randBool(0.6) ? 'slime' : 'zombie';
      } else {
        return; // Don't always spawn on surface
      }
    }

    const enemy = new Enemy(spawnX, spawnY, enemyType);
    this.enemies.push(enemy);
  }

  render(ctx, camera) {
    for (const enemy of this.enemies) {
      enemy.render(ctx, camera);
    }
  }

  clear() {
    this.enemies = [];
  }
}