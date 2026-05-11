import { Entity } from './entity.js';
import { NPC_TYPES, ITEMS, TILE_SIZE } from './constants.js';
import { randInt, dist } from './utils.js';

export class NPC extends Entity {
  constructor(x, y, type) {
    const def = NPC_TYPES[type];
    super(x, y, 24, 40);
    this.npcType = type;
    this.def = def;
    this.color = def.color;
    this.isNPC = true;
    this.homeX = x;
    this.homeY = y;
    this.moveTimer = 0;
    this.wanderDir = 0;
    this.shopOpen = false;
  }

  update(dt, player, tileSystem) {
    if (!this.alive) return;
    const dtFactor = dt * 60;

    this.moveTimer -= dtFactor;
    if (this.moveTimer <= 0) {
      this.wanderDir = (Math.random() - 0.5) * 2;
      this.moveTimer = randInt(60, 180);
    }

    this.vx = this.wanderDir * 0.3;
    if (this.vx > 0.01) this.facingRight = true;
    else if (this.vx < -0.01) this.facingRight = false;

    // Stay near home
    const d = dist(this.x, this.y, this.homeX, this.homeY);
    if (d > 200) {
      const dx = this.homeX - this.x;
      const dy = this.homeY - this.y;
      const dd = Math.sqrt(dx * dx + dy * dy);
      this.vx = (dx / dd) * 1;
      this.vy = (dy / dd) * 0.5;
    }

    this.updatePhysics(tileSystem, dt);
  }

  render(ctx, camera) {
    if (!this.alive) return;
    const sp = camera.worldToScreen(this.x, this.y);

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(sp.x, sp.y, this.width, this.height);

    // Head
    ctx.fillStyle = '#F5D0A9';
    ctx.fillRect(sp.x + 2, sp.y - 8, this.width - 4, 12);

    // Name
    ctx.fillStyle = '#FFF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.def.name, sp.x + this.width / 2, sp.y - 12);
    ctx.textAlign = 'left';
  }
}

export class NPCSpawner {
  constructor(world) {
    this.world = world;
    this.npcs = [];
    this.unlockedTypes = ['guide']; // Guide is always available
  }

  checkUnlocks(player, bossesDefeated) {
    for (const [type, def] of Object.entries(NPC_TYPES)) {
      if (this.unlockedTypes.includes(type)) continue;
      if (!def.requirements) {
        this.unlockedTypes.push(type);
        continue;
      }
      const req = def.requirements;
      let met = true;

      if (req.coins && player.coins) {
        const totalCopper = (player.coins.platinum || 0) * 1000000 +
                            (player.coins.gold || 0) * 10000 +
                            (player.coins.silver || 0) * 100 +
                            (player.coins.copper || 0);
        if (totalCopper < req.coins) met = false;
      }

      if (req.maxHealth && player.maxHealth < req.maxHealth) met = false;
      if (req.bossesDefeated && bossesDefeated < req.bossesDefeated) met = false;

      if (req.inventory && player.getItemCount(req.inventory) <= 0) met = false;

      if (met) {
        this.unlockedTypes.push(type);
      }
    }
  }

  spawnNPC(player) {
    for (const type of this.unlockedTypes) {
      if (this.npcs.some(n => n.npcType === type)) continue;

      const spawnX = player.x + randInt(-300, 300);
      const spawnY = Math.max(100, player.y - 100);
      const npc = new NPC(spawnX, spawnY, type);
      this.npcs.push(npc);
      break;
    }
  }

  update(dt, player, tileSystem) {
    for (const npc of this.npcs) {
      npc.update(dt, player, tileSystem);
    }
  }

  render(ctx, camera) {
    for (const npc of this.npcs) {
      if (npc.alive) {
        npc.render(ctx, camera);
      }
    }
  }

  clear() {
    this.npcs = [];
  }
}