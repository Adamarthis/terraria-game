import { ITEMS, ITEM, TILE_SIZE } from './constants.js';

export class InventoryUI {
  constructor(player) {
    this.player = player;
    this.open = false;
    this.dragSlot = null;
    this.dragItem = null;
    this.containerOpen = false;
    this.containerItems = [];
  }

  toggle() {
    this.open = !this.open;
    if (!this.open) {
      this.dragSlot = null;
      this.dragItem = null;
    }
  }

  openContainer(items) {
    this.containerItems = items || [];
    this.containerOpen = true;
    this.open = true;
  }

  closeContainer() {
    this.containerItems = [];
    this.containerOpen = false;
  }

  handleClick(mx, my, ctx) {
    if (!this.open) return;

    const canvas = ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;

    // Calculate inventory grid
    const gridCols = 10;
    const gridRows = 5;
    const slotSize = 36;
    const padding = 4;
    const invWidth = gridCols * (slotSize + padding) + padding;
    const invHeight = gridRows * (slotSize + padding) + padding;
    const startX = (w - invWidth) / 2;
    const startY = (h - invHeight) / 2 - 40;

    // Check main inventory slots
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const idx = row * gridCols + col;
        if (idx >= this.player.inventory.length) break;

        const sx = startX + col * (slotSize + padding) + padding;
        const sy = startY + row * (slotSize + padding) + padding;

        if (mx >= sx && mx <= sx + slotSize && my >= sy && my <= sy + slotSize) {
          if (this.dragItem) {
            // Place dragged item
            const existing = this.player.inventory[idx];
            this.player.inventory[idx] = this.dragItem;
            if (existing) {
              this.dragItem = existing;
            } else {
              this.dragItem = null;
            }
          } else {
            // Pick up item
            const slot = this.player.inventory[idx];
            if (slot) {
              this.dragItem = slot;
              this.player.inventory[idx] = null;
            }
          }
          return;
        }
      }
    }

    // Equipment slots
    const equipY = startY - 50;
    const equipSlots = ['helmet', 'chestplate', 'leggings', 'accessory'];
    for (let i = 0; i < equipSlots.length; i++) {
      const sx = startX + i * (slotSize + padding) + padding;
      const sy = equipY;
      if (mx >= sx && mx <= sx + slotSize && my >= sy && my <= sy + slotSize) {
        if (this.dragItem) {
          const def = ITEMS[this.dragItem.id];
          if (def && def.armorSlot === equipSlots[i]) {
            const existing = this.player.equipment[equipSlots[i]];
            this.player.equipment[equipSlots[i]] = this.dragItem;
            this.dragItem = existing || null;
          }
        } else {
          const existing = this.player.equipment[equipSlots[i]];
          if (existing) {
            this.dragItem = existing;
            this.player.equipment[equipSlots[i]] = null;
          }
        }
        return;
      }
    }

    // Hotbar slots (shown at bottom, but also clickable in inventory)
    const hotbarY = h - slotSize - padding - 10;
    for (let col = 0; col < 10; col++) {
      const sx = (w - (10 * (slotSize + padding) + padding)) / 2 + col * (slotSize + padding) + padding;
      const sy = hotbarY;
      if (mx >= sx && mx <= sx + slotSize && my >= sy && my <= sy + slotSize) {
        const invIdx = this.player.hotbar[col];
        if (this.dragItem) {
          const existing = this.player.inventory[invIdx];
          this.player.inventory[invIdx] = this.dragItem;
          this.dragItem = existing || null;
        } else {
          const slot = this.player.inventory[invIdx];
          if (slot) {
            this.dragItem = slot;
            this.player.inventory[invIdx] = null;
          }
        }
        return;
      }
    }

    // Container slots
    if (this.containerOpen) {
      const containerY = startY + invHeight + 20;
      for (let i = 0; i < this.containerItems.length; i++) {
        const col = i % gridCols;
        const row = Math.floor(i / gridCols);
        const sx = startX + col * (slotSize + padding) + padding;
        const sy = containerY + row * (slotSize + padding) + padding;
        if (mx >= sx && mx <= sx + slotSize && my >= sy && my <= sy + slotSize) {
          if (this.dragItem) {
            const existing = this.containerItems[i];
            this.containerItems[i] = this.dragItem;
            this.dragItem = existing || null;
          } else {
            const slot = this.containerItems[i];
            if (slot) {
              this.dragItem = slot;
              this.containerItems[i] = null;
            }
          }
          return;
        }
      }
    }

    // Click outside drops item
    if (this.dragItem) {
      // Drop item on ground - implemented in game
      this.dragItem = null;
    }
  }

  render(ctx) {
    if (!this.open) return;

    const canvas = ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    const gridCols = 10;
    const gridRows = 5;
    const slotSize = 36;
    const padding = 4;
    const invWidth = gridCols * (slotSize + padding) + padding;
    const invHeight = gridRows * (slotSize + padding) + padding;
    const startX = (w - invWidth) / 2;
    const startY = (h - invHeight) / 2 - 40;

    // Title
    ctx.fillStyle = '#FFF';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INVENTORY', w / 2, startY - 20);

    // Equipment slots
    const equipY = startY - 50;
    const equipLabels = ['Helmet', 'Chest', 'Legs', 'Acc'];
    for (let i = 0; i < 4; i++) {
      const sx = startX + i * (slotSize + padding) + padding;
      this.drawSlot(ctx, sx, equipY, slotSize, this.player.equipment[['helmet', 'chestplate', 'leggings', 'accessory'][i]], equipLabels[i]);
    }

    // Draw inventory grid
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const idx = row * gridCols + col;
        if (idx >= this.player.inventory.length) break;

        const sx = startX + col * (slotSize + padding) + padding;
        const sy = startY + row * (slotSize + padding) + padding;
        this.drawSlot(ctx, sx, sy, slotSize, this.player.inventory[idx]);
      }
    }

    // Container sections
    if (this.containerOpen) {
      const containerY = startY + invHeight + 20;
      ctx.fillStyle = '#FFF';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CHEST', w / 2, containerY - 10);

      for (let i = 0; i < this.containerItems.length; i++) {
        const col = i % gridCols;
        const row = Math.floor(i / gridCols);
        const sx = startX + col * (slotSize + padding) + padding;
        const sy = containerY + row * (slotSize + padding) + padding;
        this.drawSlot(ctx, sx, sy, slotSize, this.containerItems[i]);
      }
    }

    // Hotbar at bottom
    const hotbarY = h - slotSize - padding - 10;
    for (let col = 0; col < 10; col++) {
      const sx = (w - (10 * (slotSize + padding) + padding)) / 2 + col * (slotSize + padding) + padding;
      const sy = hotbarY;
      const invIdx = this.player.hotbar[col];
      this.drawSlot(ctx, sx, sy, slotSize, this.player.inventory[invIdx], `${col + 1}`);

      // Highlight selected
      if (col === this.player.selectedHotbar) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx - 1, sy - 1, slotSize + 2, slotSize + 2);
      }
    }

    // Drag item
    if (this.dragItem) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(w / 2 - 30, h / 2 - 30, 60, 60);
      const def = ITEMS[this.dragItem.id];
      if (def) {
        ctx.fillStyle = '#000';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(def.name, w / 2, h / 2 - 5);
        ctx.fillText(`x${this.dragItem.count}`, w / 2, h / 2 + 10);
      }
    }

    ctx.textAlign = 'left';
  }

  drawSlot(ctx, x, y, size, item, label = '') {
    // Slot background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);

    if (item) {
      const def = ITEMS[item.id];
      ctx.fillStyle = '#EEE';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      if (def) {
        ctx.fillText(def.name.substring(0, 8), x + size / 2, y + size / 2 - 2);
      }
      ctx.fillText(`x${item.count}`, x + size / 2, y + size / 2 + 10);
      ctx.textAlign = 'left';
    }

    if (label) {
      ctx.fillStyle = '#AAA';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + size / 2, y + size + 12);
      ctx.textAlign = 'left';
    }
  }
}