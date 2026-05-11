// ---- WORLD ----
export const WORLD_WIDTH = 8400;
export const WORLD_HEIGHT = 2400;
export const TILE_SIZE = 16;
export const SURFACE_HEIGHT = 200; // rows above ground

// ---- TILE IDS ----
export const T = {
  AIR: 0,
  DIRT: 1,
  GRASS: 2,
  STONE: 3,
  SAND: 4,
  WOOD: 5,
  LEAF: 6,
  COPPER_ORE: 7,
  IRON_ORE: 8,
  SILVER_ORE: 9,
  GOLD_ORE: 10,
  DEMONITE_ORE: 11,
  HELLSTONE: 12,
  OBSIDIAN: 13,
  ASH: 14,
  MUD: 15,
  SNOW: 16,
  ICE: 17,
  GRANITE: 18,
  MARBLE: 19,
  CLAY: 20,
  EBONSTONE: 21,
  PURPLE_GRASS: 22,
  JUNGLE_GRASS: 23,
  LAVA: 24,
  WATER: 25,
  PLATFORM: 26,
  CHEST: 27,
  TORCH: 28,
  FURNACE: 29,
  WORKBENCH: 30,
  ANVIL: 31,
  DOOR: 32,
  CACTUS: 33,
  SNOW_BLOCK: 34,
  COPPER_BAR: 35,
  IRON_BAR: 36,
  SILVER_BAR: 37,
  GOLD_BAR: 38,
  DEMONITE_BAR: 39,
  HELLSTONE_BAR: 40,
};

// ---- ITEM IDS (matching tile IDs for placeable blocks, plus non-block items) ----
export const ITEM = {
  // blocks (0-40 match tile ids)
  DIRT: 1, GRASS: 2, STONE: 3, SAND: 4, WOOD: 5,
  COPPER_ORE: 7, IRON_ORE: 8, SILVER_ORE: 9, GOLD_ORE: 10,
  DEMONITE_ORE: 11, HELLSTONE: 12, OBSIDIAN: 13, ASH: 14,
  MUD: 15, SNOW: 16, ICE: 17, GRANITE: 18, MARBLE: 19, CLAY: 20,
  EBONSTONE: 21, PLATFORM: 26, CHEST: 27, TORCH: 28,
  FURNACE: 29, WORKBENCH: 30, ANVIL: 31, CACTUS: 33,
  // tools
  COPPER_PICKAXE: 100, IRON_PICKAXE: 101, SILVER_PICKAXE: 102, GOLD_PICKAXE: 103, DEMONITE_PICKAXE: 104, HELLSTONE_PICKAXE: 105,
  COPPER_AXE: 110, IRON_AXE: 111, SILVER_AXE: 112, GOLD_AXE: 113, DEMONITE_AXE: 114, HELLSTONE_AXE: 115,
  COPPER_SWORD: 120, IRON_SWORD: 121, SILVER_SWORD: 122, GOLD_SWORD: 123, DEMONITE_SWORD: 124, HELLSTONE_SWORD: 125,
  COPPER_BOW: 130, IRON_BOW: 131, DEMONITE_BOW: 132, HELLSTONE_BOW: 133,
  // magic
  AMBER_STAFF: 140, RUBY_STAFF: 141, DIAMOND_STAFF: 142, DEMONITE_STAFF: 143, HELLSTONE_STAFF: 144,
  // summoner
  SLIME_STAFF: 150, IMP_STAFF: 151, HORNET_STAFF: 152,
  // ammo
  ARROW: 160, MUSKET_BALL: 161,
  // materials
  GEL: 170, LENS: 171, SOUL_OF_LIGHT: 172, SOUL_OF_NIGHT: 173,
  COPPER_BAR: 35, IRON_BAR: 36, SILVER_BAR: 37, GOLD_BAR: 38, DEMONITE_BAR: 39, HELLSTONE_BAR: 40,
  // consumables
  LESSER_HEALTH_POTION: 180, HEALTH_POTION: 181, GREATER_HEALTH_POTION: 182,
  LESSER_MANA_POTION: 183, MANA_POTION: 184, GREATER_MANA_POTION: 185,
  MANA_CRYSTAL: 186, LIFE_CRYSTAL: 187,
  // boss summon
  SUSPICIOUS_EYE: 190, WORM_FOOD: 191, GUIDE_VOODOO: 192,
  FALLEN_STAR: 193,
  FEATHER: 194,
  // armor
  COPPER_HELMET: 200, COPPER_CHESTPLATE: 201, COPPER_LEGGINGS: 202,
  IRON_HELMET: 203, IRON_CHESTPLATE: 204, IRON_LEGGINGS: 205,
  SILVER_HELMET: 206, SILVER_CHESTPLATE: 207, SILVER_LEGGINGS: 208,
  GOLD_HELMET: 209, GOLD_CHESTPLATE: 210, GOLD_LEGGINGS: 211,
  DEMONITE_HELMET: 212, DEMONITE_CHESTPLATE: 213, DEMONITE_LEGGINGS: 214,
  HELLSTONE_HELMET: 215, HELLSTONE_CHESTPLATE: 216, HELLSTONE_LEGGINGS: 217,
  // misc
  COIN_COPPER: 300, COIN_SILVER: 301, COIN_GOLD: 302, COIN_PLATINUM: 303,
};

// ---- TILE COLORS ----
export const TILE_COLORS = {
  [T.AIR]: null,
  [T.DIRT]: '#8B5E3C',
  [T.GRASS]: '#3A8C28',
  [T.STONE]: '#6B6B6B',
  [T.SAND]: '#D4B96A',
  [T.WOOD]: '#6B3A1F',
  [T.LEAF]: '#2D6B1A',
  [T.COPPER_ORE]: '#B87333',
  [T.IRON_ORE]: '#C19A6B',
  [T.SILVER_ORE]: '#C0C0C0',
  [T.GOLD_ORE]: '#FFD700',
  [T.DEMONITE_ORE]: '#6B0080',
  [T.HELLSTONE]: '#8B0000',
  [T.OBSIDIAN]: '#1A1A2E',
  [T.ASH]: '#4A4A4A',
  [T.MUD]: '#5C4033',
  [T.SNOW]: '#F0F0FF',
  [T.ICE]: '#ADD8E6',
  [T.GRANITE]: '#505050',
  [T.MARBLE]: '#E8E8E8',
  [T.CLAY]: '#C4A67A',
  [T.EBONSTONE]: '#4B0082',
  [T.PURPLE_GRASS]: '#7B2D8E',
  [T.JUNGLE_GRASS]: '#228B22',
  [T.LAVA]: '#FF4500',
  [T.WATER]: '#1E90FF',
  [T.PLATFORM]: '#8B5E3C',
  [T.CHEST]: '#8B4513',
  [T.TORCH]: '#FFA500',
  [T.FURNACE]: '#555555',
  [T.WORKBENCH]: '#8B5E3C',
  [T.ANVIL]: '#333333',
  [T.DOOR]: '#6B3A1F',
  [T.CACTUS]: '#2E8B2E',
  [T.SNOW_BLOCK]: '#F0F0FF',
  [T.COPPER_BAR]: '#B87333',
  [T.IRON_BAR]: '#A9A9A9',
  [T.SILVER_BAR]: '#C0C0C0',
  [T.GOLD_BAR]: '#FFD700',
  [T.DEMONITE_BAR]: '#8B008B',
  [T.HELLSTONE_BAR]: '#8B0000',
};

// ---- ITEM DEFINITIONS ----
export const ITEMS = {};

function defineItem(id, name, type, props = {}) {
  ITEMS[id] = { id, name, type, ...props };
}

defineItem(ITEM.DIRT, 'Dirt', 'block', { stackSize: 999, tileId: T.DIRT });
defineItem(ITEM.GRASS, 'Grass', 'block', { stackSize: 999, tileId: T.GRASS });
defineItem(ITEM.STONE, 'Stone', 'block', { stackSize: 999, tileId: T.STONE });
defineItem(ITEM.SAND, 'Sand', 'block', { stackSize: 999, tileId: T.SAND });
defineItem(ITEM.WOOD, 'Wood', 'block', { stackSize: 999, tileId: T.WOOD });
defineItem(ITEM.COPPER_ORE, 'Copper Ore', 'block', { stackSize: 999, tileId: T.COPPER_ORE });
defineItem(ITEM.IRON_ORE, 'Iron Ore', 'block', { stackSize: 999, tileId: T.IRON_ORE });
defineItem(ITEM.SILVER_ORE, 'Silver Ore', 'block', { stackSize: 999, tileId: T.SILVER_ORE });
defineItem(ITEM.GOLD_ORE, 'Gold Ore', 'block', { stackSize: 999, tileId: T.GOLD_ORE });
defineItem(ITEM.DEMONITE_ORE, 'Demonite Ore', 'block', { stackSize: 999, tileId: T.DEMONITE_ORE });
defineItem(ITEM.HELLSTONE, 'Hellstone', 'block', { stackSize: 999, tileId: T.HELLSTONE });
defineItem(ITEM.OBSIDIAN, 'Obsidian', 'block', { stackSize: 999, tileId: T.OBSIDIAN });
defineItem(ITEM.ASH, 'Ash', 'block', { stackSize: 999, tileId: T.ASH });
defineItem(ITEM.MUD, 'Mud', 'block', { stackSize: 999, tileId: T.MUD });
defineItem(ITEM.SNOW, 'Snow', 'block', { stackSize: 999, tileId: T.SNOW });
defineItem(ITEM.ICE, 'Ice', 'block', { stackSize: 999, tileId: T.ICE });
defineItem(ITEM.GRANITE, 'Granite', 'block', { stackSize: 999, tileId: T.GRANITE });
defineItem(ITEM.MARBLE, 'Marble', 'block', { stackSize: 999, tileId: T.MARBLE });
defineItem(ITEM.CLAY, 'Clay', 'block', { stackSize: 999, tileId: T.CLAY });
defineItem(ITEM.EBONSTONE, 'Ebonstone', 'block', { stackSize: 999, tileId: T.EBONSTONE });
defineItem(ITEM.PLATFORM, 'Platform', 'block', { stackSize: 999, tileId: T.PLATFORM });
defineItem(ITEM.CHEST, 'Chest', 'block', { stackSize: 99, tileId: T.CHEST });
defineItem(ITEM.TORCH, 'Torch', 'block', { stackSize: 999, tileId: T.TORCH });
defineItem(ITEM.FURNACE, 'Furnace', 'block', { stackSize: 99, tileId: T.FURNACE });
defineItem(ITEM.WORKBENCH, 'Workbench', 'block', { stackSize: 99, tileId: T.WORKBENCH });
defineItem(ITEM.ANVIL, 'Anvil', 'block', { stackSize: 99, tileId: T.ANVIL });
defineItem(ITEM.CACTUS, 'Cactus', 'block', { stackSize: 999, tileId: T.CACTUS });

defineItem(ITEM.COPPER_PICKAXE, 'Copper Pickaxe', 'tool', { damage: 4, toolPower: 35, useTime: 23, stackSize: 1 });
defineItem(ITEM.IRON_PICKAXE, 'Iron Pickaxe', 'tool', { damage: 7, toolPower: 55, useTime: 20, stackSize: 1 });
defineItem(ITEM.SILVER_PICKAXE, 'Silver Pickaxe', 'tool', { damage: 9, toolPower: 70, useTime: 18, stackSize: 1 });
defineItem(ITEM.GOLD_PICKAXE, 'Gold Pickaxe', 'tool', { damage: 11, toolPower: 85, useTime: 16, stackSize: 1 });
defineItem(ITEM.DEMONITE_PICKAXE, 'Demonite Pickaxe', 'tool', { damage: 14, toolPower: 100, useTime: 15, stackSize: 1 });
defineItem(ITEM.HELLSTONE_PICKAXE, 'Hellstone Pickaxe', 'tool', { damage: 18, toolPower: 150, useTime: 13, stackSize: 1 });

defineItem(ITEM.COPPER_AXE, 'Copper Axe', 'tool', { damage: 5, toolPower: 35, useTime: 25, stackSize: 1 });
defineItem(ITEM.IRON_AXE, 'Iron Axe', 'tool', { damage: 8, toolPower: 55, useTime: 22, stackSize: 1 });
defineItem(ITEM.SILVER_AXE, 'Silver Axe', 'tool', { damage: 10, toolPower: 70, useTime: 20, stackSize: 1 });
defineItem(ITEM.GOLD_AXE, 'Gold Axe', 'tool', { damage: 12, toolPower: 85, useTime: 18, stackSize: 1 });
defineItem(ITEM.DEMONITE_AXE, 'Demonite Axe', 'tool', { damage: 15, toolPower: 100, useTime: 17, stackSize: 1 });
defineItem(ITEM.HELLSTONE_AXE, 'Hellstone Axe', 'tool', { damage: 19, toolPower: 150, useTime: 15, stackSize: 1 });

defineItem(ITEM.COPPER_SWORD, 'Copper Sword', 'weapon', { damage: 8, useTime: 22, knockback: 4, stackSize: 1 });
defineItem(ITEM.IRON_SWORD, 'Iron Sword', 'weapon', { damage: 12, useTime: 20, knockback: 5, stackSize: 1 });
defineItem(ITEM.SILVER_SWORD, 'Silver Sword', 'weapon', { damage: 15, useTime: 18, knockback: 5, stackSize: 1 });
defineItem(ITEM.GOLD_SWORD, 'Gold Sword', 'weapon', { damage: 18, useTime: 17, knockback: 6, stackSize: 1 });
defineItem(ITEM.DEMONITE_SWORD, 'Demonite Sword', 'weapon', { damage: 23, useTime: 16, knockback: 6, stackSize: 1 });
defineItem(ITEM.HELLSTONE_SWORD, 'Hellstone Sword', 'weapon', { damage: 30, useTime: 14, knockback: 7, stackSize: 1 });

defineItem(ITEM.COPPER_BOW, 'Copper Bow', 'weapon', { damage: 9, useTime: 26, knockback: 2, stackSize: 1, ammoType: ITEM.ARROW });
defineItem(ITEM.IRON_BOW, 'Iron Bow', 'weapon', { damage: 13, useTime: 24, knockback: 2, stackSize: 1, ammoType: ITEM.ARROW });
defineItem(ITEM.DEMONITE_BOW, 'Demonite Bow', 'weapon', { damage: 20, useTime: 22, knockback: 3, stackSize: 1, ammoType: ITEM.ARROW });
defineItem(ITEM.HELLSTONE_BOW, 'Hellstone Bow', 'weapon', { damage: 28, useTime: 20, knockback: 3, stackSize: 1, ammoType: ITEM.ARROW });

defineItem(ITEM.AMBER_STAFF, 'Amber Staff', 'weapon', { damage: 14, useTime: 28, knockback: 3, stackSize: 1, manaCost: 5 });
defineItem(ITEM.RUBY_STAFF, 'Ruby Staff', 'weapon', { damage: 19, useTime: 26, knockback: 3, stackSize: 1, manaCost: 6 });
defineItem(ITEM.DIAMOND_STAFF, 'Diamond Staff', 'weapon', { damage: 25, useTime: 24, knockback: 4, stackSize: 1, manaCost: 8 });
defineItem(ITEM.DEMONITE_STAFF, 'Demonite Staff', 'weapon', { damage: 30, useTime: 22, knockback: 4, stackSize: 1, manaCost: 10 });
defineItem(ITEM.HELLSTONE_STAFF, 'Hellstone Staff', 'weapon', { damage: 40, useTime: 20, knockback: 5, stackSize: 1, manaCost: 12 });

defineItem(ITEM.SLIME_STAFF, 'Slime Staff', 'weapon', { damage: 8, useTime: 28, knockback: 2, stackSize: 1, manaCost: 10, minionDamage: 6 });
defineItem(ITEM.IMP_STAFF, 'Imp Staff', 'weapon', { damage: 17, useTime: 26, knockback: 3, stackSize: 1, manaCost: 12, minionDamage: 14 });
defineItem(ITEM.HORNET_STAFF, 'Hornet Staff', 'weapon', { damage: 13, useTime: 27, knockback: 2, stackSize: 1, manaCost: 11, minionDamage: 10 });

defineItem(ITEM.ARROW, 'Arrow', 'ammo', { stackSize: 999, damage: 5 });
defineItem(ITEM.MUSKET_BALL, 'Musket Ball', 'ammo', { stackSize: 999, damage: 7 });

defineItem(ITEM.GEL, 'Gel', 'material', { stackSize: 999 });
defineItem(ITEM.LENS, 'Lens', 'material', { stackSize: 99 });
defineItem(ITEM.SOUL_OF_LIGHT, 'Soul of Light', 'material', { stackSize: 99 });
defineItem(ITEM.SOUL_OF_NIGHT, 'Soul of Night', 'material', { stackSize: 99 });
defineItem(ITEM.COPPER_BAR, 'Copper Bar', 'material', { stackSize: 999 });
defineItem(ITEM.IRON_BAR, 'Iron Bar', 'material', { stackSize: 999 });
defineItem(ITEM.SILVER_BAR, 'Silver Bar', 'material', { stackSize: 999 });
defineItem(ITEM.GOLD_BAR, 'Gold Bar', 'material', { stackSize: 999 });
defineItem(ITEM.DEMONITE_BAR, 'Demonite Bar', 'material', { stackSize: 999 });
defineItem(ITEM.HELLSTONE_BAR, 'Hellstone Bar', 'material', { stackSize: 999 });

defineItem(ITEM.LESSER_HEALTH_POTION, 'Lesser Health Potion', 'consumable', { stackSize: 30, healAmount: 50 });
defineItem(ITEM.HEALTH_POTION, 'Health Potion', 'consumable', { stackSize: 30, healAmount: 100 });
defineItem(ITEM.GREATER_HEALTH_POTION, 'Greater Health Potion', 'consumable', { stackSize: 30, healAmount: 200 });
defineItem(ITEM.LESSER_MANA_POTION, 'Lesser Mana Potion', 'consumable', { stackSize: 30, manaAmount: 50 });
defineItem(ITEM.MANA_POTION, 'Mana Potion', 'consumable', { stackSize: 30, manaAmount: 100 });
defineItem(ITEM.GREATER_MANA_POTION, 'Greater Mana Potion', 'consumable', { stackSize: 30, manaAmount: 200 });
defineItem(ITEM.MANA_CRYSTAL, 'Mana Crystal', 'consumable', { stackSize: 99, maxManaIncrease: 20 });
defineItem(ITEM.LIFE_CRYSTAL, 'Life Crystal', 'consumable', { stackSize: 99, maxHealthIncrease: 20 });

defineItem(ITEM.SUSPICIOUS_EYE, 'Suspicious Looking Eye', 'bossSummon', { stackSize: 20 });
defineItem(ITEM.WORM_FOOD, 'Worm Food', 'bossSummon', { stackSize: 20 });
defineItem(ITEM.GUIDE_VOODOO, 'Guide Voodoo Doll', 'bossSummon', { stackSize: 20 });
defineItem(ITEM.FALLEN_STAR, 'Fallen Star', 'material', { stackSize: 99 });
defineItem(ITEM.FEATHER, 'Feather', 'material', { stackSize: 99 });

defineItem(ITEM.COPPER_HELMET, 'Copper Helmet', 'armor', { defense: 2, stackSize: 1, armorSlot: 'helmet' });
defineItem(ITEM.COPPER_CHESTPLATE, 'Copper Chestplate', 'armor', { defense: 3, stackSize: 1, armorSlot: 'chestplate' });
defineItem(ITEM.COPPER_LEGGINGS, 'Copper Greaves', 'armor', { defense: 2, stackSize: 1, armorSlot: 'leggings' });
defineItem(ITEM.IRON_HELMET, 'Iron Helmet', 'armor', { defense: 3, stackSize: 1, armorSlot: 'helmet' });
defineItem(ITEM.IRON_CHESTPLATE, 'Iron Chestplate', 'armor', { defense: 4, stackSize: 1, armorSlot: 'chestplate' });
defineItem(ITEM.IRON_LEGGINGS, 'Iron Greaves', 'armor', { defense: 3, stackSize: 1, armorSlot: 'leggings' });
defineItem(ITEM.SILVER_HELMET, 'Silver Helmet', 'armor', { defense: 4, stackSize: 1, armorSlot: 'helmet' });
defineItem(ITEM.SILVER_CHESTPLATE, 'Silver Chestplate', 'armor', { defense: 5, stackSize: 1, armorSlot: 'chestplate' });
defineItem(ITEM.SILVER_LEGGINGS, 'Silver Greaves', 'armor', { defense: 4, stackSize: 1, armorSlot: 'leggings' });
defineItem(ITEM.GOLD_HELMET, 'Gold Helmet', 'armor', { defense: 5, stackSize: 1, armorSlot: 'helmet' });
defineItem(ITEM.GOLD_CHESTPLATE, 'Gold Chestplate', 'armor', { defense: 6, stackSize: 1, armorSlot: 'chestplate' });
defineItem(ITEM.GOLD_LEGGINGS, 'Gold Greaves', 'armor', { defense: 5, stackSize: 1, armorSlot: 'leggings' });
defineItem(ITEM.DEMONITE_HELMET, 'Demonite Helmet', 'armor', { defense: 6, stackSize: 1, armorSlot: 'helmet' });
defineItem(ITEM.DEMONITE_CHESTPLATE, 'Demonite Chestplate', 'armor', { defense: 7, stackSize: 1, armorSlot: 'chestplate' });
defineItem(ITEM.DEMONITE_LEGGINGS, 'Demonite Greaves', 'armor', { defense: 6, stackSize: 1, armorSlot: 'leggings' });
defineItem(ITEM.HELLSTONE_HELMET, 'Hellstone Helmet', 'armor', { defense: 8, stackSize: 1, armorSlot: 'helmet' });
defineItem(ITEM.HELLSTONE_CHESTPLATE, 'Hellstone Chestplate', 'armor', { defense: 9, stackSize: 1, armorSlot: 'chestplate' });
defineItem(ITEM.HELLSTONE_LEGGINGS, 'Hellstone Greaves', 'armor', { defense: 8, stackSize: 1, armorSlot: 'leggings' });

defineItem(ITEM.COIN_COPPER, 'Copper Coin', 'currency', { stackSize: 999 });
defineItem(ITEM.COIN_SILVER, 'Silver Coin', 'currency', { stackSize: 999 });
defineItem(ITEM.COIN_GOLD, 'Gold Coin', 'currency', { stackSize: 999 });
defineItem(ITEM.COIN_PLATINUM, 'Platinum Coin', 'currency', { stackSize: 999 });

// ---- TILE PROPERTIES ----
export const TILE_PROPS = {};

function defineTile(id, name, hardness, drops, props = {}) {
  TILE_PROPS[id] = { id, name, hardness, drops, ...props };
}

defineTile(T.AIR, 'Air', 0, []);
defineTile(T.DIRT, 'Dirt', 50, [{ itemId: ITEM.DIRT, count: 1 }]);
defineTile(T.GRASS, 'Grass', 50, [{ itemId: ITEM.DIRT, count: 1 }]);
defineTile(T.STONE, 'Stone', 100, [{ itemId: ITEM.STONE, count: 1 }]);
defineTile(T.SAND, 'Sand', 40, [{ itemId: ITEM.SAND, count: 1 }]);
defineTile(T.WOOD, 'Wood', 80, [{ itemId: ITEM.WOOD, count: 1 }]);
defineTile(T.LEAF, 'Leaf', 20, [], { destroyOnMine: true });
defineTile(T.COPPER_ORE, 'Copper Ore', 110, [{ itemId: ITEM.COPPER_ORE, count: 1 }]);
defineTile(T.IRON_ORE, 'Iron Ore', 130, [{ itemId: ITEM.IRON_ORE, count: 1 }]);
defineTile(T.SILVER_ORE, 'Silver Ore', 150, [{ itemId: ITEM.SILVER_ORE, count: 1 }]);
defineTile(T.GOLD_ORE, 'Gold Ore', 170, [{ itemId: ITEM.GOLD_ORE, count: 1 }]);
defineTile(T.DEMONITE_ORE, 'Demonite Ore', 200, [{ itemId: ITEM.DEMONITE_ORE, count: 1 }]);
defineTile(T.HELLSTONE, 'Hellstone', 250, [{ itemId: ITEM.HELLSTONE, count: 1 }], { requiresPickaxePower: 100 });
defineTile(T.OBSIDIAN, 'Obsidian', 200, [{ itemId: ITEM.OBSIDIAN, count: 1 }]);
defineTile(T.ASH, 'Ash', 60, [{ itemId: ITEM.ASH, count: 1 }]);
defineTile(T.MUD, 'Mud', 60, [{ itemId: ITEM.MUD, count: 1 }]);
defineTile(T.SNOW, 'Snow', 40, [{ itemId: ITEM.SNOW, count: 1 }]);
defineTile(T.ICE, 'Ice', 60, [{ itemId: ITEM.ICE, count: 1 }]);
defineTile(T.GRANITE, 'Granite', 140, [{ itemId: ITEM.GRANITE, count: 1 }]);
defineTile(T.MARBLE, 'Marble', 140, [{ itemId: ITEM.MARBLE, count: 1 }]);
defineTile(T.CLAY, 'Clay', 50, [{ itemId: ITEM.CLAY, count: 1 }]);
defineTile(T.EBONSTONE, 'Ebonstone', 160, [{ itemId: ITEM.EBONSTONE, count: 1 }]);
defineTile(T.PURPLE_GRASS, 'Purple Grass', 50, [{ itemId: ITEM.EBONSTONE, count: 1 }]);
defineTile(T.JUNGLE_GRASS, 'Jungle Grass', 50, [{ itemId: ITEM.MUD, count: 1 }]);
defineTile(T.LAVA, 'Lava', 0, [], { liquid: true, damage: 30 });
defineTile(T.WATER, 'Water', 0, [], { liquid: true });
defineTile(T.PLATFORM, 'Platform', 50, [{ itemId: ITEM.PLATFORM, count: 1 }], { platform: true });
defineTile(T.CHEST, 'Chest', 100, [{ itemId: ITEM.CHEST, count: 1 }], { container: true });
defineTile(T.TORCH, 'Torch', 0, [{ itemId: ITEM.TORCH, count: 1 }], { destroyOnMine: true, lightSource: true });
defineTile(T.FURNACE, 'Furnace', 120, [{ itemId: ITEM.FURNACE, count: 1 }]);
defineTile(T.WORKBENCH, 'Workbench', 80, [{ itemId: ITEM.WORKBENCH, count: 1 }], { craftingStation: 'workbench' });
defineTile(T.ANVIL, 'Anvil', 120, [{ itemId: ITEM.ANVIL, count: 1 }], { craftingStation: 'anvil' });
defineTile(T.DOOR, 'Door', 80, [{ itemId: ITEM.WOOD, count: 1 }]);
defineTile(T.CACTUS, 'Cactus', 40, [{ itemId: ITEM.CACTUS, count: 1 }]);
defineTile(T.SNOW_BLOCK, 'Snow Block', 50, [{ itemId: ITEM.SNOW, count: 1 }]);
defineTile(T.COPPER_BAR, 'Copper Bar', 0, []);
defineTile(T.IRON_BAR, 'Iron Bar', 0, []);
defineTile(T.SILVER_BAR, 'Silver Bar', 0, []);
defineTile(T.GOLD_BAR, 'Gold Bar', 0, []);
defineTile(T.DEMONITE_BAR, 'Demonite Bar', 0, []);
defineTile(T.HELLSTONE_BAR, 'Hellstone Bar', 0, []);

// ---- CRAFTING RECIPES ----
export const RECIPES = [
  // Workbench recipes
  { station: 'workbench', inputs: [{ id: ITEM.WOOD, count: 10 }], outputs: [{ id: ITEM.WORKBENCH, count: 1 }] },
  { station: 'workbench', inputs: [{ id: ITEM.WOOD, count: 5 }], outputs: [{ id: ITEM.PLATFORM, count: 2 }] },
  { station: 'workbench', inputs: [{ id: ITEM.WOOD, count: 3 }], outputs: [{ id: ITEM.DOOR, count: 1 }] },
  { station: 'workbench', inputs: [{ id: ITEM.WOOD, count: 15 }, { id: ITEM.GEL, count: 5 }], outputs: [{ id: ITEM.TORCH, count: 3 }] },
  { station: 'workbench', inputs: [{ id: ITEM.WOOD, count: 8 }], outputs: [{ id: ITEM.CHEST, count: 1 }] },
  // Copper tools (workbench)
  { station: 'workbench', inputs: [{ id: ITEM.COPPER_BAR, count: 12 }, { id: ITEM.WOOD, count: 4 }], outputs: [{ id: ITEM.COPPER_SWORD, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.COPPER_BAR, count: 8 }, { id: ITEM.WOOD, count: 3 }], outputs: [{ id: ITEM.COPPER_PICKAXE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.COPPER_BAR, count: 9 }, { id: ITEM.WOOD, count: 3 }], outputs: [{ id: ITEM.COPPER_AXE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.COPPER_BAR, count: 7 }, { id: ITEM.WOOD, count: 3 }], outputs: [{ id: ITEM.COPPER_BOW, count: 1 }] },
  // Iron tools
  { station: 'anvil', inputs: [{ id: ITEM.IRON_BAR, count: 8 }, { id: ITEM.WOOD, count: 3 }], outputs: [{ id: ITEM.IRON_PICKAXE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.IRON_BAR, count: 9 }, { id: ITEM.WOOD, count: 3 }], outputs: [{ id: ITEM.IRON_AXE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.IRON_BAR, count: 12 }, { id: ITEM.WOOD, count: 4 }], outputs: [{ id: ITEM.IRON_SWORD, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.IRON_BAR, count: 7 }, { id: ITEM.WOOD, count: 3 }], outputs: [{ id: ITEM.IRON_BOW, count: 1 }] },
  // Silver tools
  { station: 'anvil', inputs: [{ id: ITEM.SILVER_BAR, count: 8 }, { id: ITEM.WOOD, count: 3 }], outputs: [{ id: ITEM.SILVER_PICKAXE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.SILVER_BAR, count: 12 }, { id: ITEM.WOOD, count: 4 }], outputs: [{ id: ITEM.SILVER_SWORD, count: 1 }] },
  // Gold tools
  { station: 'anvil', inputs: [{ id: ITEM.GOLD_BAR, count: 8 }, { id: ITEM.WOOD, count: 3 }], outputs: [{ id: ITEM.GOLD_PICKAXE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.GOLD_BAR, count: 12 }, { id: ITEM.WOOD, count: 4 }], outputs: [{ id: ITEM.GOLD_SWORD, count: 1 }] },
  // Demonite tools
  { station: 'anvil', inputs: [{ id: ITEM.DEMONITE_BAR, count: 10 }, { id: ITEM.WOOD, count: 4 }], outputs: [{ id: ITEM.DEMONITE_PICKAXE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.DEMONITE_BAR, count: 15 }, { id: ITEM.WOOD, count: 5 }], outputs: [{ id: ITEM.DEMONITE_SWORD, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.DEMONITE_BAR, count: 10 }, { id: ITEM.WOOD, count: 4 }], outputs: [{ id: ITEM.DEMONITE_BOW, count: 1 }] },
  // Hellstone tools
  { station: 'anvil', inputs: [{ id: ITEM.HELLSTONE_BAR, count: 15 }, { id: ITEM.WOOD, count: 5 }], outputs: [{ id: ITEM.HELLSTONE_PICKAXE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.HELLSTONE_BAR, count: 20 }, { id: ITEM.WOOD, count: 5 }], outputs: [{ id: ITEM.HELLSTONE_SWORD, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.HELLSTONE_BAR, count: 15 }, { id: ITEM.WOOD, count: 5 }], outputs: [{ id: ITEM.HELLSTONE_BOW, count: 1 }] },
  // Armor
  { station: 'anvil', inputs: [{ id: ITEM.COPPER_BAR, count: 15 }], outputs: [{ id: ITEM.COPPER_HELMET, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.COPPER_BAR, count: 25 }], outputs: [{ id: ITEM.COPPER_CHESTPLATE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.COPPER_BAR, count: 20 }], outputs: [{ id: ITEM.COPPER_LEGGINGS, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.IRON_BAR, count: 15 }], outputs: [{ id: ITEM.IRON_HELMET, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.IRON_BAR, count: 25 }], outputs: [{ id: ITEM.IRON_CHESTPLATE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.IRON_BAR, count: 20 }], outputs: [{ id: ITEM.IRON_LEGGINGS, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.SILVER_BAR, count: 15 }], outputs: [{ id: ITEM.SILVER_HELMET, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.SILVER_BAR, count: 25 }], outputs: [{ id: ITEM.SILVER_CHESTPLATE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.SILVER_BAR, count: 20 }], outputs: [{ id: ITEM.SILVER_LEGGINGS, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.GOLD_BAR, count: 15 }], outputs: [{ id: ITEM.GOLD_HELMET, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.GOLD_BAR, count: 25 }], outputs: [{ id: ITEM.GOLD_CHESTPLATE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.GOLD_BAR, count: 20 }], outputs: [{ id: ITEM.GOLD_LEGGINGS, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.DEMONITE_BAR, count: 15 }], outputs: [{ id: ITEM.DEMONITE_HELMET, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.DEMONITE_BAR, count: 25 }], outputs: [{ id: ITEM.DEMONITE_CHESTPLATE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.DEMONITE_BAR, count: 20 }], outputs: [{ id: ITEM.DEMONITE_LEGGINGS, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.HELLSTONE_BAR, count: 20 }], outputs: [{ id: ITEM.HELLSTONE_HELMET, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.HELLSTONE_BAR, count: 30 }], outputs: [{ id: ITEM.HELLSTONE_CHESTPLATE, count: 1 }] },
  { station: 'anvil', inputs: [{ id: ITEM.HELLSTONE_BAR, count: 25 }], outputs: [{ id: ITEM.HELLSTONE_LEGGINGS, count: 1 }] },
  // Furnace recipes (smelting)
  { station: 'furnace', inputs: [{ id: ITEM.COPPER_ORE, count: 3 }], outputs: [{ id: ITEM.COPPER_BAR, count: 1 }] },
  { station: 'furnace', inputs: [{ id: ITEM.IRON_ORE, count: 3 }], outputs: [{ id: ITEM.IRON_BAR, count: 1 }] },
  { station: 'furnace', inputs: [{ id: ITEM.SILVER_ORE, count: 3 }], outputs: [{ id: ITEM.SILVER_BAR, count: 1 }] },
  { station: 'furnace', inputs: [{ id: ITEM.GOLD_ORE, count: 3 }], outputs: [{ id: ITEM.GOLD_BAR, count: 1 }] },
  { station: 'furnace', inputs: [{ id: ITEM.DEMONITE_ORE, count: 3 }], outputs: [{ id: ITEM.DEMONITE_BAR, count: 1 }] },
  { station: 'furnace', inputs: [{ id: ITEM.HELLSTONE, count: 3 }], outputs: [{ id: ITEM.HELLSTONE_BAR, count: 1 }] },
  // Potions (by hand)
  { station: null, inputs: [{ id: ITEM.GEL, count: 2 }, { id: ITEM.COPPER_ORE, count: 1 }], outputs: [{ id: ITEM.LESSER_HEALTH_POTION, count: 1 }] },
  { station: null, inputs: [{ id: ITEM.GEL, count: 5 }, { id: ITEM.IRON_ORE, count: 2 }], outputs: [{ id: ITEM.HEALTH_POTION, count: 1 }] },
  // Boss summons
  { station: null, inputs: [{ id: ITEM.LENS, count: 6 }], outputs: [{ id: ITEM.SUSPICIOUS_EYE, count: 1 }] },
  { station: null, inputs: [{ id: ITEM.DEMONITE_ORE, count: 5 }, { id: ITEM.GEL, count: 5 }], outputs: [{ id: ITEM.WORM_FOOD, count: 1 }] },
  // Mana Crystal
  { station: null, inputs: [{ id: ITEM.FALLEN_STAR, count: 3 }], outputs: [{ id: ITEM.MANA_CRYSTAL, count: 1 }], note: 'requires fallen stars at night' },
  // Staves (anvil)
  { station: 'anvil', inputs: [{ id: ITEM.DEMONITE_BAR, count: 15 }, { id: ITEM.LENS, count: 3 }], outputs: [{ id: ITEM.DEMONITE_STAFF, count: 1 }] },
];

// ---- ENEMY DEFINITIONS ----
export const ENEMY_TYPES = {
  slime: { name: 'Slime', health: 35, damage: 6, defense: 0, knockbackResist: 0.1, color: '#32CD32', width: 28, height: 20, xp: 5, drops: [{ itemId: ITEM.GEL, chance: 0.5, count: 1 }] },
  zombie: { name: 'Zombie', health: 50, damage: 12, defense: 2, knockbackResist: 0.3, color: '#6B8E23', width: 28, height: 36, xp: 10, drops: [{ itemId: ITEM.GEL, chance: 0.2, count: 1 }] },
  demonEye: { name: 'Demon Eye', health: 40, damage: 10, defense: 1, knockbackResist: 0.1, color: '#8B0000', width: 28, height: 28, xp: 8, drops: [{ itemId: ITEM.LENS, chance: 0.33, count: 1 }] },
  eaterOfSouls: { name: 'Eater of Souls', health: 45, damage: 14, defense: 4, knockbackResist: 0.2, color: '#4B0082', width: 24, height: 24, xp: 12, drops: [{ itemId: ITEM.DEMONITE_ORE, chance: 0.1, count: 1 }] },
  giantWorm: { name: 'Giant Worm', health: 90, damage: 15, defense: 0, knockbackResist: 0.8, color: '#8B4513', width: 20, height: 20, xp: 15, drops: [] },
  harpy: { name: 'Harpy', health: 60, damage: 18, defense: 3, knockbackResist: 0.2, color: '#DEB887', width: 30, height: 30, xp: 15, drops: [{ itemId: ITEM.FEATHER, chance: 0.3, count: 1 }] },
  lavaSlime: { name: 'Lava Slime', health: 50, damage: 15, defense: 3, knockbackResist: 0.3, color: '#FF4500', width: 28, height: 24, xp: 18, drops: [{ itemId: ITEM.GEL, chance: 0.5, count: 2 }] },
  boneSerpent: { name: 'Bone Serpent', health: 120, damage: 25, defense: 6, knockbackResist: 0.9, color: '#F5F5DC', width: 20, height: 20, xp: 25, drops: [] },
};

// ---- BOSS DEFINITIONS ----
export const BOSS_TYPES = {
  eyeOfCthulhu: {
    name: 'Eye of Cthulhu', health: 2800, damage: { phase1: 15, phase2: 25 }, defense: { phase1: 6, phase2: 0 },
    knockbackResist: 1, color: '#C41E3A', width: 56, height: 56, xp: 100,
    drops: [{ itemId: ITEM.DEMONITE_ORE, count: 30, chance: 1 }, { itemId: ITEM.LENS, count: 5, chance: 0.5 }]
  },
  eaterOfWorlds: {
    name: 'Eater of Worlds', healthPerSegment: 120, segments: 30, damage: 20, defense: 4,
    knockbackResist: 0.8, color: '#4B0082', width: 24, height: 24, xp: 50,
    drops: [{ itemId: ITEM.DEMONITE_ORE, count: 50, chance: 1 }, { itemId: ITEM.GEL, count: 20, chance: 1 }]
  },
  skeletron: {
    name: 'Skeletron', health: 4400, headHealth: 4400, handHealth: 600, damage: { head: 32, hand: 20 }, defense: { head: 10, hand: 4 },
    knockbackResist: 1, color: '#B0C4DE', width: 60, height: 60, xp: 150,
    drops: [{ itemId: ITEM.GOLD_BAR, count: 15, chance: 1 }]
  },
  wallOfFlesh: {
    name: 'Wall of Flesh', health: 8000, damage: 50, defense: 15, knockbackResist: 1,
    color: '#8B0000', width: 100, height: 60, xp: 200,
    drops: [{ itemId: ITEM.HELLSTONE_BAR, count: 20, chance: 1 }, { itemId: ITEM.SOUL_OF_LIGHT, count: 5, chance: 1 }]
  },
};

// ---- CLASSES ----
export const CLASSES = {
  melee: { name: 'Melee', defenseBoost: 2, damageBoost: 0, manaBoost: 0, minionSlots: 0, startingItems: [{ id: ITEM.COPPER_SWORD, count: 1 }, { id: ITEM.COPPER_PICKAXE, count: 1 }, { id: ITEM.COPPER_AXE, count: 1 }] },
  ranged: { name: 'Ranged', defenseBoost: 0, damageBoost: 1, manaBoost: 0, minionSlots: 0, startingItems: [{ id: ITEM.COPPER_BOW, count: 1 }, { id: ITEM.ARROW, count: 100 }, { id: ITEM.COPPER_PICKAXE, count: 1 }, { id: ITEM.COPPER_AXE, count: 1 }] },
  magic: { name: 'Magic', defenseBoost: -1, damageBoost: 1, manaBoost: 40, minionSlots: 0, startingItems: [{ id: ITEM.AMBER_STAFF, count: 1 }, { id: ITEM.COPPER_PICKAXE, count: 1 }, { id: ITEM.COPPER_AXE, count: 1 }] },
  summoner: { name: 'Summoner', defenseBoost: -2, damageBoost: 0, manaBoost: 20, minionSlots: 1, startingItems: [{ id: ITEM.SLIME_STAFF, count: 1 }, { id: ITEM.COPPER_PICKAXE, count: 1 }, { id: ITEM.COPPER_AXE, count: 1 }] },
};

// ---- GAME CONSTANTS ----
export const GRAVITY = 0.5;
export const PLAYER_SPEED = 3.5;
export const PLAYER_JUMP = -9;
export const PLAYER_WIDTH = 22;
export const PLAYER_HEIGHT = 44;
export const MAX_HEALTH = 100;
export const MAX_MANA = 100;
export const HEALTH_REGEN_RATE = 0.5; // per second
export const MANA_REGEN_RATE = 5; // per second
export const MANA_REGEN_DELAY = 60; // frames after using mana before regen starts
export const MAX_ENEMIES = 80;
export const ENEMY_SPAWN_INTERVAL = 120; // frames between spawn attempts
export const DAY_LENGTH = 12000; // ticks per day
export const TOTAL_CYCLE = 24000; // full day+night cycle
export const COLLISION_TOLERANCE = 0.001;

// ---- NPC DEFINITIONS ----
export const NPC_TYPES = {
  guide: { name: 'Guide', color: '#D2B48C', requirements: null, sells: [] },
  merchant: { name: 'Merchant', color: '#CD853F', requirements: { coins: 5000 }, sells: [{ id: ITEM.TORCH, cost: 10 }, { id: ITEM.WOOD, cost: 50 }] },
  nurse: { name: 'Nurse', color: '#FFB6C1', requirements: { maxHealth: 200 }, sells: [] },
  demolitionist: { name: 'Demolitionist', color: '#8B0000', requirements: { inventory: ITEM.GEL }, sells: [] },
  dryad: { name: 'Dryad', color: '#228B22', requirements: { bossesDefeated: 1 }, sells: [] },
  armsDealer: { name: 'Arms Dealer', color: '#696969', requirements: { inventory: ITEM.MUSKET_BALL }, sells: [] },
};

// ---- MINIMAP ----
export const MINIMAP_SIZE = 160;
export const MINIMAP_SCALE = 0.5;