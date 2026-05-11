import { Entity } from './entity.js';
import {
  T, ITEM, ITEMS, TILE_SIZE, TILE_PROPS, WORLD_WIDTH, WORLD_HEIGHT,
  PLAYER_SPEED, PLAYER_JUMP, PLAYER_WIDTH, PLAYER_HEIGHT,
  MAX_HEALTH, MAX_MANA, HEALTH_REGEN_RATE, MANA_REGEN_RATE, MANA_REGEN_DELAY,
  CLASSES
} from './constants.js';
import { clamp, dist } from './utils.js';

export class Player extends Entity {
  constructor(x, y, gameClass = 'melee') {
    super(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.maxHealth = MAX_HEALTH;
    this.health = MAX_HEALTH;
    this.maxMana = MAX_MANA;
    this.mana = MAX_MANA;
    this.breath = 200;
    this.maxBreath = 200;

    this.gameClass = gameClass;
    const classDef = CLASSES[gameClass];
    this.defense = classDef.defenseBoost;
    this.classDamageBoost = classDef.damageBoost || 0;
    this.maxMana += classDef.manaBoost || 0;
    this.mana = this.maxMana;
    this.minionSlots = classDef.minionSlots || 0;

    // Inventory: array of { id, count } or null
    this.inventory = new Array(50).fill(null);
    this.hotbar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // indices into inventory
    this.selectedHotbar = 0;

    // Equipment
    this.equipment = { helmet: null, chestplate: null, leggings: null, accessory: null };

    // Give starting items
    this.giveStartingItems(classDef.startingItems);

    // Movement state
    this.moveLeft = false;
    this.moveRight = false;
    this.wantsJump = false;
    this.canJump = true;
    this.wantsMine = false;
    this.wantsPlace = false;
    this.wantsAttack = false;

    // Action cooldowns
    this.useTimer = 0;
    this.manaRegenDelay = 0;
    this.healthRegenTimer = 0;
    this.manaRegenTimer = 0;

    // Animation
    this.swingProgress = 0;
    this.isSwinging = false;
    this.invulnerableTimer = 0;

    // Mining
    this.miningCooldown = 0;

    // Minions
    this.minions = [];

    // coins
    this.coins = { copper: 0, silver: 0, gold: 0, platinum: 0 };
  }

  giveStartingItems(items) {
    for (const item of items) {
      this.addItemToInventory(item.id, item.count);
    }
  }

  getSelectedItem() {
    const idx = this.hotbar[this.selectedHotbar];
    return this.inventory[idx];
  }

  getSelectedItemDef() {
    const item = this.getSelectedItem();
    if (!item) return null;
    return ITEMS[item.id];
  }

  getTotalDefense() {
    let total = this.defense;
    for (const slot of ['helmet', 'chestplate', 'leggings']) {
      const item = this.equipment[slot];
      if (item && ITEMS[item.id]) {
        total += ITEMS[item.id].defense || 0;
      }
    }
    return total;
  }

  update(dt, tileSystem) {
    const dtFactor = dt * 60;

    // Handle movement
    const speed = PLAYER_SPEED;
    if (this.moveLeft) { this.vx = -speed; this.facingRight = false; }
    else if (this.moveRight) { this.vx = speed; this.facingRight = true; }

    // Jump
    if (this.wantsJump && this.onGround) {
      this.vy = PLAYER_JUMP;
      this.onGround = false;
    }

    // Physics
    this.updatePhysics(tileSystem, dt);
    this.defense = this.getTotalDefense();

    // Cooldowns
    if (this.useTimer > 0) this.useTimer -= dtFactor;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dtFactor;
    if (this.miningCooldown > 0) this.miningCooldown -= dtFactor;

    // Health regen
    this.healthRegenTimer += dtFactor;
    if (this.healthRegenTimer >= 60) {
      this.healthRegenTimer = 0;
      if (this.health < this.maxHealth && this.health > 0) {
        this.health = Math.min(this.maxHealth, this.health + 1);
      }
    }

    // Mana regen
    if (this.manaRegenDelay > 0) {
      this.manaRegenDelay -= dtFactor;
    } else {
      this.manaRegenTimer += dtFactor;
      if (this.manaRegenTimer >= 15) {
        this.manaRegenTimer = 0;
        if (this.mana < this.maxMana) {
          this.mana = Math.min(this.maxMana, this.mana + 1);
        }
      }
    }

    // Swing animation
    if (this.isSwinging) {
      this.swingProgress += dtFactor * 0.1;
      if (this.swingProgress >= 1) {
        this.swingProgress = 0;
        this.isSwinging = false;
      }
    }

    // Breath underwater
    const headTile = tileSystem.tileAtWorld(this.centerX, this.y + 2);
    if (headTile.id === T.WATER) {
      this.breath -= dtFactor;
      if (this.breath <= 0) {
        this.takeDamage(2);
      }
    } else {
      this.breath = Math.min(this.maxBreath, this.breath + dtFactor * 2);
    }

    // Update minions
    for (const minion of this.minions) {
      minion.update(dt, this);
    }
  }

  swingItem() {
    if (this.useTimer > 0) return;
    const item = this.getSelectedItemDef();
    if (!item) return;

    if (item.manaCost && this.mana < item.manaCost) return;

    // Consume mana
    if (item.manaCost) {
      this.mana -= item.manaCost;
      this.manaRegenDelay = MANA_REGEN_DELAY;
    }

    this.isSwinging = true;
    this.swingProgress = 0;
    this.useTimer = item.useTime || 20;
  }

  addItemToInventory(itemId, count = 1) {
    const def = ITEMS[itemId];
    const maxStack = def ? def.stackSize || 999 : 999;

    // Try to stack first
    for (let i = 0; i < this.inventory.length; i++) {
      const slot = this.inventory[i];
      if (slot && slot.id === itemId && slot.count < maxStack) {
        const canAdd = Math.min(count, maxStack - slot.count);
        slot.count += canAdd;
        count -= canAdd;
        if (count <= 0) return true;
      }
    }

    // Fill empty slots
    for (let i = 0; i < this.inventory.length; i++) {
      if (!this.inventory[i]) {
        const toAdd = Math.min(count, maxStack);
        this.inventory[i] = { id: itemId, count: toAdd };
        count -= toAdd;
        if (count <= 0) return true;
      }
    }

    // Drop overflow
    return count === 0;
  }

  removeItemFromInventory(index, count = 1) {
    const slot = this.inventory[index];
    if (!slot) return 0;

    const removed = Math.min(count, slot.count);
    slot.count -= removed;
    if (slot.count <= 0) {
      this.inventory[index] = null;
    }
    return removed;
  }

  getItemCount(itemId) {
    let total = 0;
    for (const slot of this.inventory) {
      if (slot && slot.id === itemId) {
        total += slot.count;
      }
    }
    return total;
  }

  removeItem(itemId, count) {
    let remaining = count;
    for (let i = 0; i < this.inventory.length && remaining > 0; i++) {
      const slot = this.inventory[i];
      if (slot && slot.id === itemId) {
        const remove = Math.min(remaining, slot.count);
        slot.count -= remove;
        remaining -= remove;
        if (slot.count <= 0) this.inventory[i] = null;
      }
    }
    return remaining === 0;
  }

  mineTile(col, row, tileSystem) {
    const tileProps = TILE_PROPS[tileSystem.getTile(col, row)];
    if (!tileProps || tileProps.hardness <= 0) return false;

    const item = this.getSelectedItemDef();
    let toolPower = 1;
    if (item && item.toolPower) {
      toolPower = item.toolPower;
    }

    if (tileProps.requiresPickaxePower && toolPower < tileProps.requiresPickaxePower) {
      return false;
    }

    const damageAmount = Math.max(1, Math.floor(toolPower / 10));
    if (tileSystem.addDamage(col, row, damageAmount)) {
      // Break tile
      const drops = tileSystem.getDrops(col, row);
      for (const drop of drops) {
        this.addItemToInventory(drop.itemId, drop.count);
      }
      tileSystem.setTile(col, row, T.AIR);
    }
    this.miningCooldown = 10;
    return true;
  }

  placeTile(col, row, tileSystem) {
    const item = this.getSelectedItem();
    if (!item) return false;
    const def = ITEMS[item.id];
    if (!def || def.type !== 'block') return false;

    const tileId = def.tileId;
    if (tileId === undefined) return false;

    if (tileSystem.getTile(col, row) !== T.AIR) return false;

    tileSystem.setTile(col, row, tileId);
    this.removeItemFromInventory(this.hotbar[this.selectedHotbar], 1);
    return true;
  }

  addCoin(type, amount) {
    if (this.coins[type] !== undefined) {
      this.coins[type] += amount;
      this.normalizeCoins();
    }
  }

  normalizeCoins() {
    const rates = [['copper', 'silver', 100], ['silver', 'gold', 100], ['gold', 'platinum', 100]];
    for (const [from, to, rate] of rates) {
      while (this.coins[from] >= rate) {
        this.coins[from] -= rate;
        this.coins[to] = (this.coins[to] || 0) + 1;
      }
    }
  }

  render(ctx, camera) {
    if (!this.alive) return;

    const screenPos = camera.worldToScreen(this.x, this.y);

    // Body
    ctx.fillStyle = '#4A90D9';
    ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);

    // Head
    ctx.fillStyle = '#F5D0A9';
    ctx.fillRect(screenPos.x + 2, screenPos.y - 8, this.width - 4, 12);

    // Eyes
    ctx.fillStyle = '#000';
    const eyeX = this.facingRight ? screenPos.x + this.width - 8 : screenPos.x + 4;
    ctx.fillRect(eyeX, screenPos.y - 5, 3, 3);

    // Armor indicator
    if (this.equipment.helmet) {
      ctx.fillStyle = '#888';
      ctx.fillRect(screenPos.x, screenPos.y - 10, this.width, 4);
    }
    if (this.equipment.chestplate) {
      ctx.fillStyle = '#999';
      ctx.fillRect(screenPos.x - 1, screenPos.y, this.width + 2, this.height * 0.5);
    }

    // Held item
    if (this.isSwinging) {
      const angle = (this.swingProgress * Math.PI * 2) - Math.PI * 0.5;
      const dir = this.facingRight ? 1 : -1;
      const itemX = screenPos.x + this.width / 2 + Math.cos(angle) * 20 * dir;
      const itemY = screenPos.y + 10 + Math.sin(angle) * 20;
      ctx.fillStyle = '#666';
      ctx.fillRect(itemX - 2, itemY - 8, 4, 16);
    }

    // Selected item indicator
    if (this.getSelectedItem()) {
      const def = this.getSelectedItemDef();
      ctx.fillStyle = '#FFD700';
      ctx.font = '10px monospace';
      ctx.fillText(def ? def.name : '?', screenPos.x, screenPos.y - 14);
    }

    // Health bar above player
    const barW = 30;
    const barH = 4;
    const barX = screenPos.x + (this.width - barW) / 2;
    const barY = screenPos.y - 14;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#4C4';
    ctx.fillRect(barX, barY, barW * (this.health / this.maxHealth), barH);
  }
}