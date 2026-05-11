import { ITEMS, TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, MINIMAP_SIZE, TILE_COLORS, T } from './constants.js';

export class HUD {
  constructor(player, world, bossSpawner) {
    this.player = player;
    this.world = world;
    this.bossSpawner = bossSpawner;

    // Notification system
    this.notifications = [];
  }

  addNotification(text, duration = 120) {
    this.notifications.push({ text, timer: duration });
  }

  update(dt) {
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      this.notifications[i].timer -= dt * 60;
      if (this.notifications[i].timer <= 0) {
        this.notifications.splice(i, 1);
      }
    }
  }

  render(ctx, camera) {
    this.renderHealthMana(ctx);
    this.renderHotbar(ctx);
    this.renderMinimap(ctx, camera);
    this.renderCoins(ctx);
    this.renderNotifications(ctx);
    this.renderBossBar(ctx);
    this.renderBreath(ctx);
    this.renderCrosshair(ctx);
  }

  renderHealthMana(ctx) {
    const x = 15;
    let y = 15;

    // Health
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, 220, 28);
    ctx.fillStyle = '#C00';
    const healthPercent = this.player.health / this.player.maxHealth;
    ctx.fillRect(x + 2, y + 2, 216 * healthPercent, 24);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`HP ${Math.ceil(this.player.health)}/${this.player.maxHealth}`, x + 110, y + 19);
    ctx.textAlign = 'left';

    // Health bar edges
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 220, 28);

    // Mana
    y += 34;
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, 220, 28);
    ctx.fillStyle = '#00C';
    const manaPercent = this.player.mana / this.player.maxMana;
    ctx.fillRect(x + 2, y + 2, 216 * manaPercent, 24);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`MP ${Math.ceil(this.player.mana)}/${this.player.maxMana}`, x + 110, y + 19);
    ctx.textAlign = 'left';

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 220, 28);

    // Defense indicator
    y += 34;
    ctx.fillStyle = '#AAA';
    ctx.font = '12px monospace';
    ctx.fillText(`Def: ${this.player.getTotalDefense()}`, x + 5, y + 12);

    // Class indicator
    ctx.fillText(`Class: ${this.player.gameClass}`, x + 5, y + 28);
  }

  renderHotbar(ctx) {
    const canvas = ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;
    const slotSize = 40;
    const padding = 3;
    const totalWidth = 10 * slotSize + 9 * padding;
    const startX = (w - totalWidth) / 2;
    const startY = h - slotSize - 12;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(startX - 4, startY - 4, totalWidth + 8, slotSize + 8);

    for (let i = 0; i < 10; i++) {
      const sx = startX + i * (slotSize + padding);
      const invIdx = this.player.hotbar[i];
      const item = this.player.inventory[invIdx];

      // Slot background
      ctx.fillStyle = i === this.player.selectedHotbar ? '#555' : '#333';
      ctx.fillRect(sx, startY, slotSize, slotSize);

      // Slot border
      ctx.strokeStyle = i === this.player.selectedHotbar ? '#FFD700' : '#555';
      ctx.lineWidth = i === this.player.selectedHotbar ? 2 : 1;
      ctx.strokeRect(sx, startY, slotSize, slotSize);

      // Item rendering
      if (item) {
        const def = ITEMS[item.id];
        if (def) {
          ctx.fillStyle = '#EEE';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(def.name.substring(0, 6), sx + slotSize / 2, startY + slotSize / 2 - 2);
          ctx.fillText(`x${item.count}`, sx + slotSize / 2, startY + slotSize / 2 + 10);
          ctx.textAlign = 'left';
        }
      }

      // Key number
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.fillText(i + 1 === 10 ? '0' : `${i + 1}`, sx + 2, startY + 10);
    }
  }

  renderMinimap(ctx, camera) {
    const canvas = ctx.canvas;
    const right = canvas.width - 10;
    const top = 10;
    const size = MINIMAP_SIZE;
    const pixelScale = 2;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(right - size, top, size, size);

    // Calculate visible area in minimap
    const viewCol = Math.floor(camera.x / TILE_SIZE);
    const viewRow = Math.floor(camera.y / TILE_SIZE);
    const mapCols = Math.floor(size / pixelScale);
    const mapRows = Math.floor(size / pixelScale);

    for (let r = 0; r < mapRows; r++) {
      for (let c = 0; c < mapCols; c++) {
        const tileCol = viewCol + c - Math.floor(mapCols / 2);
        const tileRow = viewRow + r - Math.floor(mapRows / 2);

        if (tileCol >= 0 && tileCol < this.world.width && tileRow >= 0 && tileRow < this.world.height) {
          const tileId = this.world.tileSystem.getTile(tileCol, tileRow);
          const color = TILE_COLORS[tileId];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(right - size + c * pixelScale, top + r * pixelScale, pixelScale, pixelScale);
          }
        }
      }
    }

    // Player dot
    const playerCol = Math.floor(this.player.centerX / TILE_SIZE);
    const playerRow = Math.floor(this.player.centerY / TILE_SIZE);
    const px = right - size + (playerCol - viewCol + Math.floor(mapCols / 2)) * pixelScale;
    const py = top + (playerRow - viewRow + Math.floor(mapRows / 2)) * pixelScale;
    ctx.fillStyle = '#FF0';
    ctx.fillRect(px - 1, py - 1, 4, 4);

    // Border
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(right - size, top, size, size);
  }

  renderCoins(ctx) {
    const canvas = ctx.canvas;
    const x = canvas.width - 180;
    const y = 175;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - 5, y - 5, 130, 60);

    ctx.fillStyle = '#FFD700';
    ctx.font = '11px monospace';
    ctx.fillText(`Plat: ${this.player.coins.platinum}`, x, y + 12);
    ctx.fillStyle = '#C0C0C0';
    ctx.fillText(`Gold: ${this.player.coins.gold || 0}`, x, y + 26);
    ctx.fillStyle = '#A0A0A0';
    ctx.fillText(`Silv: ${this.player.coins.silver || 0}`, x, y + 40);
    ctx.fillStyle = '#B87333';
    ctx.fillText(`Copp: ${this.player.coins.copper || 0}`, x, y + 54);
  }

  renderNotifications(ctx) {
    const canvas = ctx.canvas;
    const y = 250;

    for (let i = 0; i < this.notifications.length; i++) {
      const note = this.notifications[i];
      const alpha = Math.min(1, note.timer / 30);
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(note.text, canvas.width / 2, y + i * 18);
      ctx.textAlign = 'left';
    }
  }

  renderBossBar(ctx) {
    if (!this.bossSpawner || !this.bossSpawner.bossActive || !this.bossSpawner.activeBoss) return;

    const boss = this.bossSpawner.activeBoss;
    const canvas = ctx.canvas;
    const w = canvas.width;
    const barW = 400;
    const barH = 30;
    const x = (w - barW) / 2;
    const y = 60;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x - 4, y - 4, barW + 8, barH + 8);

    // Boss name
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(boss.def.name, w / 2, y - 8);

    // Health bar
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = '#F44';
    ctx.fillRect(x + 2, y + 2, (barW - 4) * (boss.health / boss.maxHealth), barH - 4);

    // HP text
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${Math.ceil(boss.health)} / ${boss.maxHealth}`, w / 2, y + 20);
    ctx.textAlign = 'left';
  }

  renderBreath(ctx) {
    const player = this.player;
    if (player.breath >= player.maxBreath) return;

    const canvas = ctx.canvas;
    const w = canvas.width;
    const barW = 100;
    const barH = 10;
    const x = (w - barW) / 2;
    const y = 100;

    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = '#08F';
    ctx.fillRect(x + 1, y + 1, (barW - 2) * (player.breath / player.maxBreath), barH - 2);
  }

  renderCrosshair(ctx) {
    const canvas = ctx.canvas;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
  }
}