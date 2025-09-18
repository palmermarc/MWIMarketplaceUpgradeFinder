export class ItemClassificationService {
  // Combat equipment slots that affect combat performance
  private static readonly COMBAT_SLOTS = new Set([
    'head',
    'neck',
    'body',
    'legs',
    'feet',
    'ring1',
    'ring2',
    'weapon1',
    'weapon2',
    'shield',
    'arrow',
    'earring1',
    'earring2'
  ]);

  // Tool slots that don't affect combat
  private static readonly TOOL_SLOTS = new Set([
    'tool',
    'pickaxe',
    'axe',
    'rod',
    'net',
    'hammer',
    'pot',
    'chisel',
    'needle',
    'saw',
    'scissors'
  ]);

  // Combat-related item keywords
  private static readonly COMBAT_KEYWORDS = [
    'sword', 'bow', 'staff', 'dagger', 'mace', 'spear', 'crossbow',
    'armor', 'helmet', 'shield', 'boots', 'gloves', 'ring', 'amulet',
    'necklace', 'earring', 'arrow', 'robe', 'chestplate', 'leggings',
    'hood', 'cowl', 'gauntlets', 'bracers', 'cloak', 'cape'
  ];

  // Tool-related item keywords
  private static readonly TOOL_KEYWORDS = [
    'pickaxe', 'axe', 'hammer', 'chisel', 'needle', 'saw', 'scissors',
    'pot', 'rod', 'net', 'hoe', 'scythe', 'sickle', 'knife', 'tongs'
  ];

  /**
   * Determines if an item is combat-related based on its slot and name
   */
  static isCombatItem(itemHrid: string, slot?: string): boolean {
    const itemName = itemHrid.toLowerCase();

    // Check by slot first (most reliable)
    if (slot) {
      const normalizedSlot = slot.toLowerCase();
      if (this.COMBAT_SLOTS.has(normalizedSlot)) {
        return true;
      }
      if (this.TOOL_SLOTS.has(normalizedSlot)) {
        return false;
      }
    }

    // Check by item name keywords
    const hasToolKeyword = this.TOOL_KEYWORDS.some(keyword =>
      itemName.includes(keyword)
    );

    if (hasToolKeyword) {
      return false;
    }

    const hasCombatKeyword = this.COMBAT_KEYWORDS.some(keyword =>
      itemName.includes(keyword)
    );

    return hasCombatKeyword;
  }

  /**
   * Filters upgrade opportunities to only include combat items
   */
  static filterCombatUpgrades<T extends { currentItem: { slot: string; itemHrid: string } }>(
    upgrades: T[]
  ): T[] {
    return upgrades.filter(upgrade =>
      this.isCombatItem(upgrade.currentItem.itemHrid, upgrade.currentItem.slot)
    );
  }

  /**
   * Gets the combat slot mapping for the simulator
   */
  static getCombatSlotMapping(slot: string): string | null {
    const slotMap: { [key: string]: string } = {
      'head': 'head',
      'neck': 'neck',
      'body': 'body',
      'legs': 'legs',
      'feet': 'feet',
      'ring1': 'ring1',
      'ring2': 'ring2',
      'weapon1': 'weapon1',
      'weapon2': 'weapon2',
      'shield': 'shield',
      'arrow': 'arrow',
      'earring1': 'earring1',
      'earring2': 'earring2'
    };

    return slotMap[slot.toLowerCase()] || null;
  }
}