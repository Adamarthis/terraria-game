import { Camera } from './camera.js';
import { World } from './world.js';
import { Player } from './player.js';
import { CombatSystem } from './combat.js';
import { EnemySpawner } from './enemy.js';
import { BossSpawner } from './boss.js';
import { NPCSpawner } from './npc.js';
import { InventoryUI } from './inventory.js';
import { CraftingUI } from './crafting.js';
import { HUD } from './hud.js';
import { DayNightCycle } from './daynight.js';
import { AudioSystem } from './audio.js';
import { NetworkManager } from './networking.js';
import {
  T, ITEMS, ITEM, TILE_SIZE, TILE_PROPS, WORLD_WIDTH, WORLD_HEIGHT,
  PLAYER_WIDTH, PLAYER_HEIGHT
} from './constants.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.camera = null;
    this.world = null;
    this.player = null;
    this.combat = null;
    this.enemySpawner = null;
    this.bossSpawner = null;
    this.npcSpawner = null;
    this.inventoryUI = null;
    this.craftingUI = null;
    this.hud = null;
    this.dayNight = null;
    this.audio = null;
    this.network = null;

    this.running = false;
    this.lastTime = 0;
    this.gameState = 'menu'; // menu, playing, paused, gameOver

    // Input
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.rightMouseDown = false;

    // Bosses defeated tracker
    this.bossesDefeated = 0;

    // Multiplayer
    this.playerName = 'Player';
    this.multiplayer = false;

    // Menu state
    this.menuSelection = 0;
    this.showClassSelect = false;
    this.selectedClass = 0;
    this.classNames = ['melee', 'ranged', 'magic', 'summoner'];
    this.charName = 'Adventurer';

    this.init();
  }

  init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.combat = new CombatSystem();
    this.dayNight = new DayNightCycle();
    this.audio = new AudioSystem();
    this.network = new NetworkManager(this);

    // Input handlers
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      if (this.camera) this.camera.setCanvasSize(this.canvas.width, this.canvas.height);
    });

    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);

    // Prevent scroll with space
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') e.preventDefault();
    });
  }

  startGame() {
    this.gameState = 'loading';

    // Generate world
    setTimeout(() => {
      const seed = Math.floor(Math.random() * 2147483647);
      this.world = new World(seed);
      this.world.generate();

      this.player = new Player(this.world.spawnX, this.world.spawnY, this.classNames[this.selectedClass]);

      this.enemySpawner = new EnemySpawner(this.world);
      this.bossSpawner = new BossSpawner();
      this.npcSpawner = new NPCSpawner(this.world);
      this.inventoryUI = new InventoryUI(this.player);
      this.craftingUI = new CraftingUI(this.player);
      this.hud = new HUD(this.player, this.world, this.bossSpawner);

      this.camera.follow(this.player);
      this.audio.init();

      this.gameState = 'playing';
      this.hud.addNotification('Welcome to Wryzmkvn! WASD to move, click to mine, right-click to place');
      this.hud.addNotification('Press E for inventory, C for crafting');
    }, 50);
  }

  gameLoop(time) {
    if (!this.running) return;
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    if (this.gameState === 'playing') {
      this.update(dt);
      this.render(this.ctx);
    } else if (this.gameState === 'menu') {
      this.renderMenu(this.ctx);
    } else if (this.gameState === 'loading') {
      this.renderLoading(this.ctx);
    } else if (this.gameState === 'gameOver') {
      this.renderGameOver(this.ctx);
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    if (!this.player || !this.player.alive) {
      this.gameState = 'gameOver';
      return;
    }

    // Update player input
    this.player.moveLeft = this.keys['KeyA'] || this.keys['ArrowLeft'];
    this.player.moveRight = this.keys['KeyD'] || this.keys['ArrowRight'];
    this.player.wantsJump = this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space'];

    // Update systems
    this.dayNight.update(dt);
    this.player.update(dt, this.world.tileSystem);

    // Camera
    this.camera.follow(this.player);
    this.camera.update(dt);

    // Mining
    if (this.mouseDown && !this.inventoryUI.open && !this.craftingUI.open) {
      const worldPos = this.camera.screenToWorld(this.mouseX, this.mouseY);
      const tileCol = Math.floor(worldPos.x / TILE_SIZE);
      const tileRow = Math.floor(worldPos.y / TILE_SIZE);
      const tile = this.world.tileSystem.getTile(tileCol, tileRow);

      if (tile !== T.AIR && tile !== T.WATER && tile !== T.LAVA) {
        if (this.player.miningCooldown <= 0) {
          this.player.mineTile(tileCol, tileRow, this.world.tileSystem);
          this.audio.playMineSound();

          if (this.network.connected) {
            this.network.sendBlockAction(tileCol, tileRow, 'mine');
          }
        }
      }
    }

    // Right click - place block
    if (this.rightMouseDown && !this.inventoryUI.open && !this.craftingUI.open) {
      this.rightMouseDown = false; // single place action
      const worldPos = this.camera.screenToWorld(this.mouseX, this.mouseY);
      const tileCol = Math.floor(worldPos.x / TILE_SIZE);
      const tileRow = Math.floor(worldPos.y / TILE_SIZE);

      const item = this.player.getSelectedItem();
      if (item) {
        const def = ITEMS[item.id];
        if (def && def.type === 'block') {
          this.player.placeTile(tileCol, tileRow, this.world.tileSystem);
          this.audio.playCraftSound();

          if (this.network.connected) {
            this.network.sendBlockAction(tileCol, tileRow, 'place', def.tileId);
          }
        } else if (def && def.type === 'consumable') {
          // Use consumable (potions, etc.)
          if (def.healAmount && this.player.health < this.player.maxHealth) {
            this.player.heal(def.healAmount);
            this.player.removeItemFromInventory(this.player.hotbar[this.player.selectedHotbar], 1);
          } else if (def.manaAmount && this.player.mana < this.player.maxMana) {
            this.player.mana = Math.min(this.player.maxMana, this.player.mana + def.manaAmount);
            this.player.removeItemFromInventory(this.player.hotbar[this.player.selectedHotbar], 1);
          } else if (def.maxHealthIncrease) {
            this.player.maxHealth += def.maxHealthIncrease;
            this.player.health = this.player.maxHealth;
            this.player.removeItemFromInventory(this.player.hotbar[this.player.selectedHotbar], 1);
            this.hud.addNotification(`Max HP increased to ${this.player.maxHealth}!`);
          } else if (def.maxManaIncrease) {
            this.player.maxMana += def.maxManaIncrease;
            this.player.mana = this.player.maxMana;
            this.player.removeItemFromInventory(this.player.hotbar[this.player.selectedHotbar], 1);
            this.hud.addNotification(`Max MP increased to ${this.player.maxMana}!`);
          }
        } else if (def && def.type === 'bossSummon') {
          this.trySummonBoss(def);
        }
      }
    }

    // Left click attack
    if (this.keys['Attack'] || this.mouseDown) {
      if (!this.inventoryUI.open && !this.craftingUI.open) {
        this.playerAttack();
      }
      this.keys['Attack'] = false;
    }

    // Update enemies
    this.enemySpawner.update(dt, this.player, this.world.tileSystem);

    // Check enemy-player collisions (melee)
    for (const enemy of this.enemySpawner.enemies) {
      if (!enemy.alive) continue;

      // Enemy-melee-player collision to deal contact damage
      if (enemy.overlapsWith(this.player) && enemy.attackCooldown <= 0) {
        if (this.player.invulnerableTimer <= 0) {
          this.player.takeDamage(enemy.damage, Math.sign(enemy.vx) * 5, -3);
          this.player.invulnerableTimer = 20;
          enemy.attackCooldown = 30;
        }
      }

      // Check if player's melee hits enemy
      if (this.player.isSwinging) {
        const itemDef = this.player.getSelectedItemDef();
        if (itemDef && (itemDef.type === 'weapon' || itemDef.type === 'tool')) {
          if (this.combat.meleeHitCheck(this.player, enemy)) {
            const damage = (itemDef.damage || 1) + this.player.classDamageBoost;
            enemy.takeDamage(damage, this.player.facingRight ? 6 : -6, -3);
            this.audio.playHitSound();
            this.player.isSwinging = false; // Reset swing
          }
        }
      }
    }

    // Check player projectiles vs enemies
    for (let i = this.combat.projectiles.length - 1; i >= 0; i--) {
      const p = this.combat.projectiles[i];
      if (!p.isPlayerProjectile) continue;
      for (const enemy of this.enemySpawner.enemies) {
        if (!enemy.alive) continue;
        if (p.hitEntities.has(enemy.id)) continue;
        if (this.combat.checkCollision(p, enemy)) {
          const damage = p.damage + (this.player.classDamageBoost || 0);
          enemy.takeDamage(damage, p.vx * 0.3, -2);
          p.hitEntities.add(enemy.id);
          if (p.piercing <= 0) {
            p.alive = false;
          } else {
            p.piercing--;
          }
          break;
        }
      }
    }

    // Update projectiles
    this.combat.update(dt, [...this.enemySpawner.enemies, ...(this.bossSpawner.activeBoss ? [this.bossSpawner.activeBoss] : [])], this.world.tileSystem);

    // Boss update
    const bossResult = this.bossSpawner.update(dt, this.player, this.world.tileSystem, this.combat.projectiles);
    if (bossResult) {
      // Boss defeated
      this.bossesDefeated++;
      for (const drop of bossResult) {
        this.player.addItemToInventory(drop.itemId, drop.count);
      }
      this.hud.addNotification('Boss defeated!');
      this.audio.playCraftSound();
    }

    // Check player-projectile hit by enemy projectiles
    for (const p of this.combat.projectiles) {
      if (p.isPlayerProjectile) continue;
      if (this.combat.checkCollision(p, this.player) && this.player.invulnerableTimer <= 0) {
        this.player.takeDamage(p.damage, p.vx * 0.3, -2);
        this.player.invulnerableTimer = 20;
        p.alive = false;
      }
    }

    // NPC updates
    this.npcSpawner.checkUnlocks(this.player, this.bossesDefeated);
    this.npcSpawner.update(dt, this.player, this.world.tileSystem);

    // Network
    if (this.network.connected) {
      this.network.sendPlayerUpdate(this.player);
    }
    this.network.update(dt);

    // HUD
    this.hud.update(dt);
  }

  playerAttack() {
    const itemDef = this.player.getSelectedItemDef();
    if (!itemDef) return;

    if (itemDef.type === 'weapon' || itemDef.type === 'tool') {
      this.player.swingItem();

      // Ranged weapons fire projectiles
      if (itemDef.ammoType) {
        // Check for ammo
        const ammoCount = this.player.getItemCount(itemDef.ammoType);
        if (ammoCount <= 0) return;

        this.player.removeItem(itemDef.ammoType, 1);

        const centerX = this.player.centerX;
        const centerY = this.player.centerY + 10;
        const dir = this.player.facingRight ? 1 : -1;
        const projSpeed = 8;

        this.combat.fireProjectile(
          centerX, centerY,
          dir * projSpeed, 0,
          (itemDef.damage || 5),
          'player',
          { color: '#FFD700', lifetime: 60, width: 8, height: 4 }
        );
      }

      // Magic weapons fire projectiles
      if (itemDef.manaCost) {
        const centerX = this.player.centerX;
        const centerY = this.player.centerY;
        const dir = this.player.facingRight ? 1 : -1;
        const projSpeed = 7;
        const color = itemDef.id >= 140 && itemDef.id < 150 ? '#8B00FF' : '#00BFFF';

        this.combat.fireProjectile(
          centerX, centerY,
          dir * projSpeed + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2 - 1,
          (itemDef.damage || 10) + this.player.classDamageBoost,
          'player',
          { color, lifetime: 50, width: 8, height: 8, piercing: 1 }
        );
      }

      // Summon weapons
      if (itemDef.minionDamage) {
        this.summonMinion(itemDef);
      }
    }
  }

  summonMinion(itemDef) {
    if (this.player.minions.length >= this.player.minionSlots) return;

    // Simple minion - a small friendly projectile-like entity
    const minion = {
      id: Math.random(),
      x: this.player.x - 30,
      y: this.player.y - 20,
      width: 12,
      height: 12,
      damage: itemDef.minionDamage || 5,
      alive: true,
      timer: 0,
      update(dt, player) {
        this.timer += dt * 60;
        const dx = player.centerX - this.x;
        const dy = player.centerY - this.y - 20;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 200) {
          // Teleport back to player
          this.x = player.x + (Math.random() - 0.5) * 40;
          this.y = player.y - 30;
        } else if (d > 40) {
          this.x += dx / d * 2;
          this.y += dy / d * 2;
        }
      }
    };
    this.player.minions.push(minion);
  }

  trySummonBoss(itemDef) {
    const isNight = this.dayNight && this.dayNight.isNight;
    const worldTile = this.world.tileSystem.getTile(
      Math.floor(this.player.centerX / TILE_SIZE),
      Math.floor(this.player.centerY / TILE_SIZE) + 3
    );

    switch (itemDef.id) {
      case ITEM.SUSPICIOUS_EYE:
        if (!isNight) {
          this.hud.addNotification('The Eye of Cthulhu can only be summoned at night!');
          return;
        }
        this.bossSpawner.spawnEyeOfCthulhu(this.player, this.world);
        this.hud.addNotification('Eye of Cthulhu has awoken!');
        this.audio.playBossRoar();
        break;
      case ITEM.WORM_FOOD:
        if (worldTile !== T.EBONSTONE && worldTile !== T.PURPLE_GRASS) {
          this.hud.addNotification('Worm Food must be used in the Corruption!');
          return;
        }
        this.bossSpawner.spawnEaterOfWorlds(this.player, this.world);
        this.hud.addNotification('Eater of Worlds has awoken!');
        this.audio.playBossRoar();
        break;
      case ITEM.GUIDE_VOODOO:
        if (this.world.isUnderworld(Math.floor(this.player.centerY / TILE_SIZE))) {
          this.bossSpawner.spawnWallOfFlesh(this.player, this.world);
          this.hud.addNotification('Wall of Flesh has awoken!');
          this.audio.playBossRoar();
        } else {
          this.hud.addNotification('Guide Voodoo Doll must be used in the Underworld!');
        }
        break;
    }
  }

  render(ctx) {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Sky
    this.dayNight.render(ctx, this.canvas);

    // World tiles
    this.world.tileSystem.render(ctx, this.camera);

    // NPCs
    this.npcSpawner.render(ctx, this.camera);

    // Player
    this.player.render(ctx, this.camera);

    // Other players (multiplayer)
    this.network.renderOtherPlayers(ctx, this.camera);

    // Enemies
    this.enemySpawner.render(ctx, this.camera);

    // Bosses
    this.bossSpawner.render(ctx, this.camera);

    // Minions
    for (const minion of this.player.minions) {
      const sp = this.camera.worldToScreen(minion.x, minion.y);
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(sp.x, sp.y, minion.width, minion.height);
    }

    // Projectiles
    for (const p of this.combat.projectiles) {
      p.render(ctx, this.camera);
    }

    // HUD
    this.hud.render(ctx, this.camera);

    // Time display
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(this.canvas.width - 130, 5, 125, 22);
    ctx.fillStyle = '#FFF';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Day ${this.dayNight.dayCount} ${this.dayNight.timeString}`, this.canvas.width - 10, 21);
    ctx.textAlign = 'left';

    // Multiplayer status
    if (this.network.connected) {
      ctx.fillStyle = '#4C4';
      ctx.font = '10px monospace';
      ctx.fillText('Online', this.canvas.width - 130, 40);
    }

    // Inventory/Crafting UI overlay
    if (this.inventoryUI && this.inventoryUI.open) {
      this.inventoryUI.render(ctx);
    }
    if (this.craftingUI && this.craftingUI.open) {
      this.craftingUI.render(ctx);
    }

    // Drag item follow mouse
    if (this.inventoryUI && this.inventoryUI.dragItem) {
      const def = ITEMS[this.inventoryUI.dragItem.id];
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(this.mouseX - 18, this.mouseY - 18, 36, 36);
      if (def) {
        ctx.fillStyle = '#000';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(def.name.substring(0, 6), this.mouseX, this.mouseY - 2);
        ctx.fillText(`x${this.inventoryUI.dragItem.count}`, this.mouseX, this.mouseY + 10);
        ctx.textAlign = 'left';
      }
    }
  }

  renderMenu(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WRYZMKVN', w / 2, h * 0.2);

    // Subtitle
    ctx.fillStyle = '#AAA';
    ctx.font = '16px monospace';
    ctx.fillText('A Terraria-like Sandbox Adventure', w / 2, h * 0.2 + 40);

    if (this.showClassSelect) {
      this.renderClassSelect(ctx);
      return;
    }

    // Menu items
    const menuItems = ['New Game', 'Multiplayer', 'How to Play'];
    const startY = h * 0.45;
    const spacing = 50;

    for (let i = 0; i < menuItems.length; i++) {
      const y = startY + i * spacing;
      const isSelected = this.menuSelection === i;

      ctx.fillStyle = isSelected ? '#FFD700' : '#CCC';
      ctx.font = isSelected ? 'bold 28px monospace' : '24px monospace';
      ctx.fillText(menuItems[i], w / 2, y);

      if (isSelected) {
        ctx.fillStyle = '#FFD700';
        ctx.fillText('>', w / 2 - 120, y);
      }
    }

    // Controls
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    const controlsY = h * 0.75;
    ctx.fillText('WASD - Move  |  Space - Jump  |  Left Click - Mine/Attack', w / 2, controlsY);
    ctx.fillText('E - Inventory  |  C - Craft  |  1-9,0 - Hotbar', w / 2, controlsY + 20);
    ctx.fillText('Right Click - Place/Use  |  ESC - Pause', w / 2, controlsY + 40);
    ctx.textAlign = 'left';
  }

  renderClassSelect(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHOOSE YOUR CLASS', w / 2, h * 0.15);

    const classes = [
      { name: 'MELEE', desc: 'High defense, powerful swords' },
      { name: 'RANGED', desc: 'Bows & guns, keeps distance' },
      { name: 'MAGIC', desc: 'Mana-fueled staves, robes' },
      { name: 'SUMMONER', desc: 'Minion army, low defense' }
    ];

    const startY = h * 0.3;
    const spacing = 80;

    // Name input
    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Character Name:', w / 2, startY - 30);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(this.charName, w / 2, startY - 8);

    for (let i = 0; i < classes.length; i++) {
      const y = startY + i * spacing;
      const isSelected = this.selectedClass === i;

      ctx.fillStyle = isSelected ? '#FFD700' : '#888';
      ctx.font = isSelected ? 'bold 24px monospace' : '20px monospace';
      ctx.fillText(classes[i].name, w / 2, y);

      ctx.fillStyle = '#666';
      ctx.font = '14px monospace';
      ctx.fillText(classes[i].desc, w / 2, y + 20);
    }

    ctx.fillStyle = '#AAA';
    ctx.font = '16px monospace';
    ctx.fillText('Press ENTER to start!', w / 2, startY + 4 * spacing + 20);
    ctx.textAlign = 'left';
  }

  renderLoading(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#FFD700';
    ctx.font = '36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Generating World...', w / 2, h / 2 - 20);

    ctx.fillStyle = '#AAA';
    ctx.font = '16px monospace';
    ctx.fillText('Creating caves, ores, biomes and more!', w / 2, h / 2 + 20);
    ctx.textAlign = 'left';
  }

  renderGameOver(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#F44';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', w / 2, h / 2 - 40);

    ctx.fillStyle = '#FFF';
    ctx.font = '20px monospace';
    ctx.fillText('Press R to restart or Q to quit', w / 2, h / 2 + 20);
    ctx.textAlign = 'left';
  }

  // ---- INPUT HANDLING ----
  onKeyDown(e) {
    this.keys[e.code] = true;

    if (this.gameState === 'menu') {
      this.handleMenuKey(e);
      return;
    }

    if (this.gameState === 'gameOver') {
      if (e.code === 'KeyR') this.restartGame();
      if (e.code === 'KeyQ') { this.gameState = 'menu'; this.menuSelection = 0; }
      return;
    }

    if (e.code === 'Escape') {
      if (this.inventoryUI && this.inventoryUI.open) {
        this.inventoryUI.toggle();
      }
      if (this.craftingUI && this.craftingUI.open) {
        this.craftingUI.open = false;
      }
      return;
    }

    // Inventory
    if (e.code === 'KeyE') {
      if (this.inventoryUI) this.inventoryUI.toggle();
      if (this.craftingUI) this.craftingUI.open = false;
    }

    // Crafting
    if (e.code === 'KeyC') {
      // Check for nearby crafting stations
      let station = null;
      const pCol = Math.floor(this.player.centerX / TILE_SIZE);
      const pRow = Math.floor(this.player.centerY / TILE_SIZE);
      for (let dx = -3; dx <= 3; dx++) {
        for (let dy = -3; dy <= 3; dy++) {
          if (this.world.tileSystem.hasCraftingStation(pCol + dx, pRow + dy, 'workbench')) station = 'workbench';
          if (this.world.tileSystem.hasCraftingStation(pCol + dx, pRow + dy, 'anvil')) station = 'anvil';
          if (this.world.tileSystem.getTile(pCol + dx, pRow + dy) === T.FURNACE) station = 'furnace';
        }
      }

      if (this.craftingUI) {
        this.craftingUI.toggle(station);
        if (this.inventoryUI) this.inventoryUI.open = false;
      }
    }

    // Hotbar selection
    if (e.code.startsWith('Digit')) {
      const num = parseInt(e.code.replace('Digit', '')) - 1;
      if (num >= 0 && num <= 9 && this.player) {
        this.player.selectedHotbar = num;
      }
    }
    if (e.code === 'Digit0' && this.player) {
      this.player.selectedHotbar = 9;
    }

    // Attack key
    if (e.code === 'KeyF') {
      this.keys['Attack'] = true;
    }

    // Boss summon keys (debug)
    if (e.code === 'KeyB' && e.shiftKey) {
      this.bossSpawner.spawnEyeOfCthulhu(this.player, this.world);
      this.hud.addNotification('Boss summoned (debug)!');
    }
  }

  onKeyUp(e) {
    this.keys[e.code] = false;
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  onMouseDown(e) {
    if (e.button === 0) {
      this.mouseDown = true;

      // Check UI interactions
      if (this.inventoryUI && this.inventoryUI.open) {
        this.inventoryUI.handleClick(this.mouseX, this.mouseY, this.ctx);
        return;
      }
      if (this.craftingUI && this.craftingUI.open) {
        this.craftingUI.handleClick(this.mouseX, this.mouseY, this.ctx);
        return;
      }
    }
    if (e.button === 2) {
      this.rightMouseDown = true;
    }
  }

  onMouseUp(e) {
    if (e.button === 0) this.mouseDown = false;
    if (e.button === 2) this.rightMouseDown = false;
  }

  handleMenuKey(e) {
    if (this.showClassSelect) {
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        this.selectedClass = Math.max(0, this.selectedClass - 1);
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        this.selectedClass = Math.min(3, this.selectedClass + 1);
      }
      if (e.code === 'Enter') {
        this.startGame();
      }
      if (e.code === 'Escape') {
        this.showClassSelect = false;
      }
      if (e.code === 'Backspace' && this.charName.length > 0) {
        this.charName = this.charName.slice(0, -1);
      }
      if (e.code.length === 4 && e.code.startsWith('Key') && this.charName.length < 16) {
        this.charName += e.code[3];
      }
      return;
    }

    if (e.code === 'ArrowUp') {
      e.preventDefault();
      this.menuSelection = Math.max(0, this.menuSelection - 1);
    }
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      this.menuSelection = Math.min(2, this.menuSelection + 1);
    }
    if (e.code === 'Enter') {
      if (this.menuSelection === 0) {
        this.showClassSelect = true;
      } else if (this.menuSelection === 1) {
        this.startMultiplayer();
      } else if (this.menuSelection === 2) {
        this.showHelp();
      }
    }
    if (e.code === 'KeyM') {
      // Quick start
      this.showClassSelect = true;
    }
  }

  startMultiplayer() {
    this.multiplayer = true;
    this.showClassSelect = true;
  }

  showHelp() {
    // Cycle back to menu for now - instructions already shown on menu
  }

  restartGame() {
    // Reset everything
    this.player = null;
    this.world = null;
    this.enemySpawner = null;
    this.bossSpawner = null;
    this.combat.clear();
    this.npcSpawner.clear();
    this.network.clear();
    this.bossesDefeated = 0;
    this.showClassSelect = true;
  }

  // Called after game start when multiplayer
  connectToServer() {
    if (this.multiplayer) {
      const serverUrl = `ws://${window.location.hostname}:8080`;
      this.network.connect(serverUrl);
    }
  }
}

// Start the game when the page loads
let game = null;
window.addEventListener('DOMContentLoaded', () => {
  game = new Game();
  window.game = game; // Expose for debugging
});