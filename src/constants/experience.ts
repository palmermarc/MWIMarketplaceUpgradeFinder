// Experience table for all skills in Milky Way Idle
// Key: Level, Value: Cumulative experience required to reach that level
export const EXPERIENCE_TABLE: { [level: number]: number } = {
  1: 0,
  2: 33,
  3: 76,
  4: 132,
  5: 202,
  6: 286,
  7: 386,
  8: 503,
  9: 637,
  10: 791,
  11: 964,
  12: 1159,
  13: 1377,
  14: 1620,
  15: 1891,
  16: 2192,
  17: 2525,
  18: 2893,
  19: 3300,
  20: 3750,
  21: 4247,
  22: 4795,
  23: 5400,
  24: 6068,
  25: 6805,
  26: 7618,
  27: 8517,
  28: 9508,
  29: 10604,
  30: 11814,
  31: 13151,
  32: 14629,
  33: 16262,
  34: 18068,
  35: 20064,
  36: 22271,
  37: 24712,
  38: 27411,
  39: 30396,
  40: 33697,
  41: 37346,
  42: 41381,
  43: 45842,
  44: 50773,
  45: 56222,
  46: 62243,
  47: 68895,
  48: 76242,
  49: 84355,
  50: 93311,
  51: 103195,
  52: 114100,
  53: 126127,
  54: 139390,
  55: 154009,
  56: 170118,
  57: 187863,
  58: 207403,
  59: 228914,
  60: 252584,
  61: 278623,
  62: 307256,
  63: 338731,
  64: 373318,
  65: 411311,
  66: 453030,
  67: 498824,
  68: 549074,
  69: 604193,
  70: 664632,
  71: 730881,
  72: 803472,
  73: 882985,
  74: 970050,
  75: 1065351,
  76: 1169633,
  77: 1283701,
  78: 1408433,
  79: 1544780,
  80: 1693774,
  81: 1856536,
  82: 2034279,
  83: 2228321,
  84: 2440088,
  85: 2671127,
  86: 2923113,
  87: 3197861,
  88: 3497335,
  89: 3823663,
  90: 4179145,
  91: 4566274,
  92: 4987741,
  93: 5446463,
  94: 5945587,
  95: 6488521,
  96: 7078945,
  97: 7720834,
  98: 8418485,
  99: 9176537,
  100: 10000000,
  101: 11404976,
  102: 12904567,
  103: 14514400,
  104: 16242080,
  105: 18095702,
  106: 20083886,
  107: 22215808,
  108: 24501230,
  109: 26950540,
  110: 29574787,
  111: 32385721,
  112: 35395838,
  113: 38618420,
  114: 42067584,
  115: 45758332,
  116: 49706603,
  117: 53929328,
  118: 58444489,
  119: 63271179,
  120: 68429670,
  121: 73941479,
  122: 79829440,
  123: 86117783,
  124: 92832214,
  125: 100000000,
  126: 114406130,
  127: 130118394,
  128: 147319656,
  129: 166147618,
  130: 186752428,
  131: 209297771,
  132: 233962072,
  133: 260939787,
  134: 290442814,
  135: 322702028,
  136: 357968938,
  137: 396517495,
  138: 438646053,
  139: 484679494,
  140: 534971538,
  141: 589907252,
  142: 649905763,
  143: 715423218,
  144: 786955977,
  145: 865044093,
  146: 950275074,
  147: 1043287971,
  148: 1144777804,
  149: 1255500373,
  150: 1376277458,
  151: 1508002470,
  152: 1651646566,
  153: 1808265285,
  154: 1979005730,
  155: 2165114358,
  156: 2367945418,
  157: 2588970089,
  158: 2829786381,
  159: 3092129857,
  160: 3377885250,
  161: 3689099031,
  162: 4027993033,
  163: 4396979184,
  164: 4798675471,
  165: 5235923207,
  166: 5711805728,
  167: 6229668624,
  168: 6793141628,
  169: 7406162301,
  170: 8073001662,
  171: 8798291902,
  172: 9587056372,
  173: 10444742007,
  174: 11377254401,
  175: 12390995728,
  176: 13492905745,
  177: 14690506120,
  178: 15991948361,
  179: 17406065609,
  180: 18942428633,
  181: 20611406335,
  182: 22424231139,
  183: 24393069640,
  184: 26531098945,
  185: 28852589138,
  186: 31372992363,
  187: 34109039054,
  188: 37078841860,
  189: 40302007875,
  190: 43799759843,
  191: 47595067021,
  192: 51712786465,
  193: 56179815564,
  194: 61025256696,
  195: 66280594953,
  196: 71979889960,
  197: 78159982881,
  198: 84860719814,
  199: 92125192822,
  200: 100000000000
};

// Helper function to get experience required for a specific level
export const getExperienceForLevel = (level: number): number => {
  return EXPERIENCE_TABLE[level] || 0;
};

// Helper function to calculate experience needed between two levels
export const getExperienceBetweenLevels = (fromLevel: number, toLevel: number): number => {
  if (fromLevel >= toLevel) return 0;
  return getExperienceForLevel(toLevel) - getExperienceForLevel(fromLevel);
};

// Helper function to get level from total experience
export const getLevelFromExperience = (experience: number): number => {
  const levels = Object.keys(EXPERIENCE_TABLE).map(Number).sort((a, b) => a - b);

  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= EXPERIENCE_TABLE[levels[i]]) {
      return levels[i];
    }
  }

  return 1; // Minimum level
};

// Helper function to get progress towards next level
export const getProgressToNextLevel = (experience: number): {
  currentLevel: number;
  nextLevel: number;
  currentLevelExp: number;
  nextLevelExp: number;
  progressExp: number;
  progressPercentage: number;
} => {
  const currentLevel = getLevelFromExperience(experience);
  const nextLevel = Math.min(currentLevel + 1, 200);

  const currentLevelExp = getExperienceForLevel(currentLevel);
  const nextLevelExp = getExperienceForLevel(nextLevel);
  const progressExp = experience - currentLevelExp;
  const expNeededForNextLevel = nextLevelExp - currentLevelExp;
  const progressPercentage = expNeededForNextLevel > 0 ? (progressExp / expNeededForNextLevel) * 100 : 100;

  return {
    currentLevel,
    nextLevel,
    currentLevelExp,
    nextLevelExp,
    progressExp,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage))
  };
};

// Helper function to calculate levels achievable with given experience
export const getLevelsFromExperience = (startingLevel: number, startingExp: number, additionalExp: number): {
  finalLevel: number;
  finalExp: number;
  levelsGained: number;
  experienceUsed: number;
  experienceRemaining: number;
} => {
  const totalExp = startingExp + additionalExp;
  const finalLevel = getLevelFromExperience(totalExp);
  const levelsGained = finalLevel - startingLevel;
  const experienceUsed = getExperienceForLevel(finalLevel) - getExperienceForLevel(startingLevel);
  const experienceRemaining = additionalExp - experienceUsed;

  return {
    finalLevel,
    finalExp: totalExp,
    levelsGained,
    experienceUsed,
    experienceRemaining: Math.max(0, experienceRemaining)
  };
};

// Constants for common level milestones
export const LEVEL_MILESTONES = {
  MAX_LEVEL: 200,
  LEVEL_100_EXP: 10000000,
  LEVEL_125_EXP: 100000000,
  LEVEL_150_EXP: 1376277458,
  LEVEL_200_EXP: 100000000000
} as const;

// Helper function to format experience numbers
export const formatExperience = (exp: number): string => {
  if (exp >= 1000000000) {
    return `${(exp / 1000000000).toFixed(2)}B`;
  } else if (exp >= 1000000) {
    return `${(exp / 1000000).toFixed(2)}M`;
  } else if (exp >= 1000) {
    return `${(exp / 1000).toFixed(1)}K`;
  }
  return exp.toLocaleString();
};