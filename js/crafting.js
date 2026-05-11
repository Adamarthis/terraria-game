import { RECIPES, ITEMS, ITEM } from './constants.js';

export class CraftingUI {
  constructor(player) {
    this.player = player;
    this.open = false;
    this.station = null; // null = by hand, 'workbench', 'furnace', 'anvil'
    this.selectedRecipe = -1;
    this.availableRecipes = [];
  }

  toggle(station) {
    if (this.open && this.station === station) {
      this.open = false;
    } else {
      this.open = true;
      this.station = station;
      this.refreshRecipes();
    }
  }

  refreshRecipes() {
    this.availableRecipes = [];
    // Check for crafting station in nearby tiles
    for (const recipe of RECIPES) {
      if (recipe.station !== this.station) continue;
      if (this.canCraft(recipe)) {
        this.availableRecipes.push(recipe);
      }
    }
  }

  canCraft(recipe) {
    for (const input of recipe.inputs) {
      if (this.player.getItemCount(input.id) < input.count) {
        return false;
      }
    }
    return true;
  }

  craft(recipeIndex) {
    if (recipeIndex < 0 || recipeIndex >= this.availableRecipes.length) return;
    const recipe = this.availableRecipes[recipeIndex];

    if (!this.canCraft(recipe)) return;

    // Consume inputs
    for (const input of recipe.inputs) {
      this.player.removeItem(input.id, input.count);
    }

    // Add outputs
    for (const output of recipe.outputs) {
      this.player.addItemToInventory(output.id, output.count);
    }

    this.refreshRecipes();
  }

  handleClick(mx, my, ctx) {
    if (!this.open) return;

    const canvas = ctx.canvas;
    const w = canvas.width;

    const recipes = this.availableRecipes;
    const startY = canvas.height / 2 - 100;
    const slotHeight = 30;

    for (let i = 0; i < recipes.length; i++) {
      const sy = startY + i * slotHeight;
      if (mx >= w / 2 - 150 && mx <= w / 2 + 150 && my >= sy && my <= sy + slotHeight) {
        this.craft(i);
        return;
      }
    }
  }

  render(ctx) {
    if (!this.open) return;

    const canvas = ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);

    const recipes = this.availableRecipes;
    const startX = w / 2 - 180;
    const startY = h / 2 - 150;
    const slotHeight = 28;

    ctx.fillStyle = '#FFF';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    const stationName = this.station || 'By Hand';
    ctx.fillText(`CRAFTING - ${stationName.toUpperCase()}`, w / 2, startY - 20);
    ctx.textAlign = 'left';

    if (recipes.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No available recipes', w / 2, startY + 20);
      ctx.textAlign = 'left';
      return;
    }

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const sy = startY + i * slotHeight;

      // Background
      const canCraft = this.canCraft(recipe);
      ctx.fillStyle = canCraft ? 'rgba(0,80,0,0.5)' : 'rgba(80,0,0,0.4)';
      ctx.fillRect(startX, sy, 360, slotHeight - 2);

      // Recipe text
      ctx.fillStyle = canCraft ? '#FFF' : '#666';
      ctx.font = '10px monospace';

      const inputNames = recipe.inputs.map(inp => {
        const def = ITEMS[inp.id];
        return `${def ? def.name : '?'} x${inp.count}`;
      }).join(' + ');

      const outputNames = recipe.outputs.map(out => {
        const def = ITEMS[out.id];
        return `${def ? def.name : '?'} x${out.count}`;
      }).join(' + ');

      ctx.fillText(inputNames, startX + 5, sy + 12);
      ctx.fillStyle = canCraft ? '#4F4' : '#666';
      ctx.fillText('→ ' + outputNames, startX + 5, sy + 24);
    }

    ctx.textAlign = 'left';
  }
}