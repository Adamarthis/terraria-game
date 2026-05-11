import { Entity } from './entity.js';
import { BOSS_TYPES, ITEMS, TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from './constants.js';
import { randInt, randFloat, randBool, dist, genId } from './utils.js';
import { Enemy } from './enemy.js';

export class Boss extends Entity {
  constructor(x, y, type) {
    const def = BOSS_TYPES[type];
    super(x, y, def.width, def.height);
    this.bossType = type;
    this.def = def;
    this.maxHealth = def.health || def.healthPerSegment * (def.segments || 1);
    this.health = this.maxHealth;
    this.defense = def.defense;
    this.knockbackResist = 1;
    this.color = def.color;
    this.enemyAI = true;
    this.isBoss = true;
    this.attackCooldown = 0;

    // Boss phase
    this.phase = 1;
    this.aiState = 'idle';
    this.aiTimer = 0;
    this.damage = def.damage;

    // Specific state
    this.servants = [];
    this.segments = []; // for worm bosses
    this.chargeTimer = 0;
    this.isCharging = false;
  }

  update(dt, player, tileSystem, projectiles) {
    if (!this.alive) return;

    const dx = player.centerX - this.centerX;
    const dy = player.centerY - this.centerY;
    const d = dist(this.centerX, this.centerY, player.centerX, player.centerY);

    this.facingRight = dx > 0;
    this.aiTimer -= dt * 60;

    switch (this.bossType) {
      case 'eyeOfCthulhu':
        this.eyeAI(dt, player, dx, dy, d, projectiles);
        break;
      case 'eaterOfWorlds':
        this.wormAI(dt, player, dx, dy, d);
        break;
      case 'skeletron':
        this.skeletronAI(dt, player, dx, dy, d);
        break;
      case 'wallOfFlesh':
        this.wallAI(dt, player, dx, dy, d);
        break;
    }

    this.updatePhysics(tileSystem, dt);

    // Hit player on contact
    if (this.attackCooldown > 0) this.attackCooldown -= dt * 60;
    if (d < 50 && this.attackCooldown <= 0) {
      player.takeDamage(Math.floor(this.damage), Math.sign(dx) * 8, -4);
      this.attackCooldown = 20;
    }

    // Update servants
    for (let i = this.servants.length - 1; i >= 0; i--) {
      this.servants[i].update(dt, player, tileSystem);
      if (!this.servants[i].alive) this.servants.splice(i, 1);
    }
  }

  eyeAI(dt, player, dx, dy, d, projectiles) {
    const speed = 2.5;
    this.phase = this.health < this.maxHealth * 0.5 ? 2 : 1;

    if (this.phase === 1) {
      // Phase 1: Float near player, charge periodically
      if (this.aiTimer <= 0) {
        if (this.aiState === 'idle') {
          // Start charge
          this.aiState = 'charging';
          this.chargeTimer = 30;
          this.aiTimer = 60;
        } else {
          this.aiState = 'idle';
          this.aiTimer = randInt(60, 120);
        }
      }

      if (this.aiState === 'charging') {
        this.chargeTimer -= dt * 60;
        const chargeSpeed = 8;
        const targetX = player.centerX;
        const targetY = player.centerY;
        const moveX = targetX - this.centerX;
        const moveY = targetY - this.centerY;
        const moveD = Math.sqrt(moveX * moveX + moveY * moveY);
        if (moveD > 5) {
          this.vx = (moveX / moveD) * chargeSpeed;
          this.vy = (moveY / moveD) * chargeSpeed;
        }
        if (this.chargeTimer <= 0) {
          this.aiState = 'idle';
          this.aiTimer = randInt(30, 60);
        }
      } else {
        // Float near player
        const targetX = player.centerX + randFloat(-100, 100);
        const targetY = player.centerY - randFloat(50, 120);
        const moveX = targetX - this.centerX;
        const moveY = targetY - this.centerY;
        const moveD = Math.sqrt(moveX * moveX + moveY * moveY);
        if (moveD > 10) {
          this.vx += (moveX / moveD) * 0.15;
          this.vy += (moveY / moveD) * 0.15;
        }
        const speedMag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speedMag > speed) {
          this.vx = (this.vx / speedMag) * speed;
          this.vy = (this.vy / speedMag) * speed;
        }
      }
    } else {
      // Phase 2: More aggressive charging + spawn servants
      if (this.aiTimer <= 0) {
        if (this.aiState === 'idle') {
          this.aiState = 'charging';
          this.chargeTimer = 20;
          this.aiTimer = 40;

          // Spawn servants
          if (this.servants.length < 3) {
            for (let i = 0; i < 2; i++) {
              const servX = this.x + randFloat(-30, 30);
              const servY = this.y + randFloat(-30, 30);
              const servant = new Enemy(servX, servY, 'demonEye');
              servant.health = 20;
              servant.maxHealth = 20;
              this.servants.push(servant);
            }
          }
        } else {
          this.aiState = 'idle';
          this.aiTimer = randInt(30, 60);
        }
      }

      if (this.aiState === 'charging') {
        this.chargeTimer -= dt * 60;
        const chargeSpeed = 10;
        const moveX = player.centerX - this.centerX;
        const moveY = player.centerY - this.centerY;
        const moveD = Math.sqrt(moveX * moveX + moveY * moveY);
        if (moveD > 5) {
          this.vx = (moveX / moveD) * chargeSpeed;
          this.vy = (moveY / moveD) * chargeSpeed;
        }
        if (this.chargeTimer <= 0) {
          this.aiState = 'idle';
          this.aiTimer = randInt(20, 40);
        }
      } else {
        this.vx *= 0.92;
        this.vy *= 0.92;
      }
    }
  }

  wormAI(dt, player, dx, dy, d) {
    // Simple: move toward player through tiles
    if (this.aiTimer <= 0) {
      const speed = 4;
      const moveX = player.centerX - this.centerX;
      const moveY = player.centerY - this.centerY;
      const moveD = Math.sqrt(moveX * moveX + moveY * moveY);
      if (moveD > 5) {
        this.vx = (moveX / moveD) * speed;
        this.vy = (moveY / moveD) * speed;
      }
      this.aiTimer = randInt(20, 40);
    }
  }

  skeletronAI(dt, player, dx, dy, d) {
    const speed = 3;
    if (this.aiTimer <= 0) {
      if (this.aiState === 'idle') {
        this.aiState = 'charge';
        this.aiTimer = 40;
      } else {
        this.aiState = 'idle';
        this.aiTimer = randInt(60, 120);
      }
    }

    if (this.aiState === 'charge') {
      const chargeSpeed = 7;
      const moveX = player.centerX - this.centerX;
      const moveY = player.centerY - this.centerY;
      const moveD = Math.sqrt(moveX * moveX + moveY * moveY);
      if (moveD > 5) {
        this.vx = (moveX / moveD) * chargeSpeed;
        this.vy = (moveY / moveD) * chargeSpeed;
      }
    } else {
      // Orbit player
      const angle = Math.atan2(dy, dx) + Math.PI * 0.3;
      const orbitDist = 150;
      const targetX = player.centerX + Math.cos(angle) * orbitDist;
      const targetY = player.centerY + Math.sin(angle) * orbitDist - 50;
      const moveX = targetX - this.centerX;
      const moveY = targetY - this.centerY;
      const moveD = Math.sqrt(moveX * moveX + moveY * moveY);
      if (moveD > 10) {
        this.vx += (moveX / moveD) * 0.15;
        this.vy += (moveY / moveD) * 0.15;
      }
      const speedMag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speedMag > speed) {
        this.vx = (this.vx / speedMag) * speed;
        this.vy = (this.vy / speedMag) * speed;
      }
    }
  }

  wallAI(dt, player, dx, dy, d) {
    // Move horizontally toward player, slowly
    const speed = 2;
    const moveX = player.centerX - this.centerX;
    const targetX = player.centerX + randFloat(-50, 50);
    const targetY = this.y;

    this.vx = Math.sign(moveX) * speed;
    this.vy *= 0.95;

    // Spawn hungry minions
    if (this.servants.length < 5 && randBool(0.02)) {
      const servX = this.x + (this.vx > 0 ? -20 : this.width + 20);
      const servY = this.y + randFloat(0, this.height);
      const hungry = new Enemy(servX, servY, 'zombie');
      hungry.health = 30;
      hungry.maxHealth = 30;
      hungry.damage = 20;
      this.servants.push(hungry);
    }
  }

  render(ctx, camera) {
    if (!this.alive) return;
    const sp = camera.worldToScreen(this.x, this.y);

    // Main body
    ctx.fillStyle = this.color;
    ctx.fillRect(sp.x, sp.y, this.width, this.height);

    // Eyes
    ctx.fillStyle = '#FF0';
    ctx.fillRect(sp.x + 5, sp.y + 5, 10, 10);
    ctx.fillRect(sp.x + this.width - 15, sp.y + 5, 10, 10);
    ctx.fillStyle = '#000';
    ctx.fillRect(sp.x + this.facingRight ? sp.x + this.width - 12 : sp.x + 8, sp.y + 8, 5, 5);

    // Boss health bar
    const barW = 60;
    const barH = 6;
    const barX = sp.x + (this.width - barW) / 2;
    const barY = sp.y - 10;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#F44';
    ctx.fillRect(barX, barY, barW * (this.health / this.maxHealth), barH);

    // Name
    ctx.fillStyle = '#FFF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.def.name, sp.x + this.width / 2, barY - 3);

    // Render servants
    for (const servant of this.servants) {
      servant.render(ctx, camera);
    }
  }

  getDrops() {
    const drops = [];
    for (const drop of this.def.drops) {
      if (Math.random() < drop.chance) {
        drops.push({ itemId: drop.itemId, count: drop.count || 1 });
      }
    }
    return drops;
  }
}

export class BossSpawner {
  constructor() {
    this.activeBoss = null;
    this.bossActive = false;
  }

  spawnEyeOfCthulhu(player, world) {
    const x = player.x + randFloat(-200, 200);
    const y = Math.max(50, player.y - randFloat(150, 300));
    this.activeBoss = new Boss(x, y, 'eyeOfCthulhu');
    this.bossActive = true;
  }

  spawnEaterOfWorlds(player, world) {
    const x = player.x + randFloat(-100, 100);
    const y = Math.max(player.y - 100, 50);
    this.activeBoss = new Boss(x, y, 'eaterOfWorlds');
    this.bossActive = true;
  }

  spawnSkeletron(player, world) {
    const x = player.x + randFloat(-200, 200);
    const y = Math.max(50, player.y - randFloat(200, 300));
    this.activeBoss = new Boss(x, y, 'skeletron');
    this.bossActive = true;
  }

  spawnWallOfFlesh(player, world) {
    const underworldY = (world.height - 200) * TILE_SIZE;
    const x = player.x;
    this.activeBoss = new Boss(x, underworldY, 'wallOfFlesh');
    this.bossActive = true;
  }

  update(dt, player, tileSystem, projectiles) {
    if (!this.bossActive || !this.activeBoss) return;

    this.activeBoss.update(dt, player, tileSystem, projectiles);

    if (!this.activeBoss.alive) {
      this.bossActive = false;
      return this.activeBoss.getDrops();
    }
    return null;
  }

  render(ctx, camera) {
    if (this.activeBoss && this.activeBoss.alive) {
      this.activeBoss.render(ctx, camera);
    }
  }

  clear() {
    this.activeBoss = null;
    this.bossActive = false;
  }
}