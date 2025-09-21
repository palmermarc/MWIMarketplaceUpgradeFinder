export interface SkillInfo {
  skillHrid: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

export interface SkillsByCategory {
  [category: string]: SkillInfo[];
}

// Helper function to create skill HRID
const createSkillHrid = (name: string): string => {
  return `/skills/${name.toLowerCase().replace(/\s+/g, '_')}`;
};

// Helper function to create skill info
const createSkill = (name: string, description: string, category: string): SkillInfo => ({
  skillHrid: createSkillHrid(name),
  name: name.toLowerCase().replace(/\s+/g, '_'),
  displayName: name,
  description,
  category
});

export const SKILLS_BY_CATEGORY: SkillsByCategory = {
  gathering: [
    createSkill('Milking', 'mooooooooo...', 'gathering'),
    createSkill('Foraging', 'Master the skill of picking up things', 'gathering'),
    createSkill('Woodcutting', 'Chop chop', 'gathering')
  ],
  artisan: [
    createSkill('Cheesesmithing', 'Make equipment using special hardened cheeses', 'artisan'),
    createSkill('Crafting', 'Create weapons, jewelry, and more', 'artisan'),
    createSkill('Tailoring', 'Create ranged and magic clothing', 'artisan'),
    createSkill('Cooking', 'The art of making healthy food', 'artisan'),
    createSkill('Brewing', 'The art of making tasty drinks', 'artisan'),
    createSkill('Alchemy', 'Transform items into other items', 'artisan'),
    createSkill('Enhancing', 'Make equipment more powerful', 'artisan')
  ],
  combat: [
    createSkill('Combat', 'Fight monsters', 'combat'),
    createSkill('Stamina', 'Physical endurance for combat', 'combat'),
    createSkill('Intelligence', 'Mental capacity for magic', 'combat'),
    createSkill('Attack', 'Offensive combat prowess', 'combat'),
    createSkill('Power', 'Raw combat strength', 'combat'),
    createSkill('Defense', 'Defensive combat abilities', 'combat'),
    createSkill('Ranged', 'Long-distance combat skills', 'combat'),
    createSkill('Magic', 'Mystical combat abilities', 'combat')
  ]
};

// Flattened list of all skills
export const ALL_SKILLS: SkillInfo[] = Object.values(SKILLS_BY_CATEGORY).flat();

// Helper functions
export const getSkillByHrid = (hrid: string): SkillInfo | undefined => {
  return ALL_SKILLS.find(skill => skill.skillHrid === hrid);
};

export const getSkillByName = (name: string): SkillInfo | undefined => {
  return ALL_SKILLS.find(skill => skill.name === name);
};

export const getSkillsByCategory = (category: string): SkillInfo[] => {
  return SKILLS_BY_CATEGORY[category] || [];
};

export const getSkillCategory = (skillHrid: string): string | undefined => {
  for (const [category, skills] of Object.entries(SKILLS_BY_CATEGORY)) {
    if (skills.some(skill => skill.skillHrid === skillHrid)) {
      return category;
    }
  }
  return undefined;
};

// Category display names for UI
export const SKILL_CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  gathering: 'Gathering Skills',
  artisan: 'Artisan Skills',
  combat: 'Combat Skills'
};

// Skill display order for consistent UI presentation
export const SKILL_DISPLAY_ORDER = [
  // Gathering
  'milking',
  'foraging',
  'woodcutting',
  // Artisan
  'cheesesmithing',
  'crafting',
  'tailoring',
  'cooking',
  'brewing',
  'alchemy',
  'enhancing',
  // Combat
  'combat',
  'stamina',
  'intelligence',
  'attack',
  'power',
  'defense',
  'ranged',
  'magic'
];

// Get skills in display order
export const getSkillsInDisplayOrder = (): SkillInfo[] => {
  return SKILL_DISPLAY_ORDER.map(skillName =>
    ALL_SKILLS.find(skill => skill.name === skillName)
  ).filter(Boolean) as SkillInfo[];
};