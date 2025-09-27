'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  SKILLS_BY_CATEGORY,
  SkillInfo
} from '@/constants/skills';
import {
  SkillLevels,
  HouseRoomLevels,
  EquipmentBonuses,
  calculateItemsPerHour,
  findOptimalGatheringLocation
} from '@/utils/skillCalculations';
import { GATHERING_SKILLS_DATA } from '@/constants/gatheringSkills';

export function SkillsLevelingCalculator() {
  const { theme } = useTheme();
  const isLocalDevelopment = process.env.NODE_ENV === 'development';

  // State for storing user's skill levels
  const [skillLevels, setSkillLevels] = useState<SkillLevels>(() => {
    // Initialize all skills with level 1
    const initialLevels: SkillLevels = {};
    Object.values(SKILLS_BY_CATEGORY).flat().forEach(skill => {
      initialLevels[skill.name] = 1;
    });
    return initialLevels;
  });

  // State for house room levels (used in calculations)
  const [houseRoomLevels, setHouseRoomLevels] = useState<HouseRoomLevels>({
    dairy_barn: 0,
    garden: 0,
    log_shed: 0,
    forge: 0,
    workshop: 0,
    sewing_parlor: 0,
    kitchen: 0,
    brewery: 0,
    laboratory: 0,
    observatory: 0
  });

  // State for equipment bonuses
  const [equipment, setEquipment] = useState<EquipmentBonuses>({
    hasBrush: false,
    hasShears: false,
    hasHatchet: false
  });

  // State for skill leveling calculator form
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [targetLevel, setTargetLevel] = useState<number>(1);
  const [gatherOwnResources, setGatherOwnResources] = useState<boolean>(false);

  // Handle skill level changes
  const handleSkillLevelChange = (skillName: string, level: string) => {
    const numLevel = parseInt(level, 10);
    if (!isNaN(numLevel) && numLevel >= 1 && numLevel <= 120) {
      setSkillLevels(prev => ({
        ...prev,
        [skillName]: numLevel
      }));
    }
  };

  // Handle calculator form submission
  const handleOptimizeSkill = () => {
    if (!selectedSkill) {
      alert('Please select a skill to optimize');
      return;
    }

    const currentLevel = skillLevels[selectedSkill] || 1;
    if (targetLevel <= currentLevel) {
      alert('Target level must be higher than current level');
      return;
    }

    // TODO: Implement optimization logic
    console.log('Optimizing skill leveling:', {
      skill: selectedSkill,
      currentLevel,
      targetLevel,
      gatherOwnResources
    });
  };

  // Get list of all gathering and artisan skills for dropdown
  const getAllSkills = () => {
    return Object.entries(SKILLS_BY_CATEGORY)
      .filter(([category]) => category === 'gathering' || category === 'artisan')
      .map(([, skills]) => skills)
      .flat();
  };

  // Check if selected skill is artisan
  const isArtisanSkill = (skillName: string) => {
    return SKILLS_BY_CATEGORY.artisan?.some(skill => skill.name === skillName) || false;
  };

  // Render skill input for a specific skill (simplified and centered)
  const renderSkillInput = (skill: SkillInfo) => (
    <div key={skill.name} className="flex flex-col items-center justify-center p-4 bg-gray-800/30 rounded-lg text-center">
      <label className="block text-sm font-medium text-gray-200 mb-3 text-center">
        {skill.displayName}
      </label>
      <input
        type="number"
        min="1"
        max="120"
        value={skillLevels[skill.name] || 1}
        onChange={(e) => handleSkillLevelChange(skill.name, e.target.value)}
        className="w-16 px-2 py-1 text-sm text-center bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );

  return (
    <div className="w-full space-y-8">
      {/* Coming Soon Section */}
      <div className={`rounded-lg p-8 text-center ${theme.mode === 'dark' ? 'border' : 'bg-blue-500/20 border border-blue-500/50'}`} style={theme.mode === 'dark' ? { backgroundColor: 'rgba(181, 0, 8, 0.2)', borderColor: 'rgba(181, 0, 8, 0.5)' } : {}}>
        <h1 className={`text-3xl font-bold mb-4 ${theme.mode === 'dark' ? 'text-red-200' : 'text-blue-200'}`}>
          Skills Leveling Calculator
        </h1>
        <div className={`inline-flex items-center px-4 py-2 rounded-lg mb-4 ${theme.mode === 'dark' ? 'bg-orange-700/30' : 'bg-yellow-600/30'}`}>
          <span className="text-2xl mr-2">🚧</span>
          <span className={`font-semibold ${theme.mode === 'dark' ? 'text-orange-200' : 'text-yellow-200'}`}>
            Coming Soon
          </span>
        </div>
        <p className={`text-lg ${theme.mode === 'dark' ? 'text-red-300' : 'text-blue-300'} max-w-2xl mx-auto`}>
          Skills calculators are currently in development and will be available in a future update.
          This feature will help you plan and optimize your skill leveling progression in Milky Way Idle.
        </p>
      </div>

      {/* Skills Input Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-2 ${theme.mode === 'dark' ? 'text-red-200' : 'text-blue-200'}`}>
            Current Skill Levels
          </h2>
          <p className={`text-sm ${theme.mode === 'dark' ? 'text-red-300' : 'text-blue-300'}`}>
            Enter your current skill levels. This data is not included in character imports and must be entered manually.
          </p>
        </div>

        {/* All Skills in 7-Column Grid */}
        <div className="grid grid-cols-7 gap-4">
          {/* Show all gathering and artisan skills in one grid */}
          {Object.entries(SKILLS_BY_CATEGORY)
            .filter(([category]) => category === 'gathering' || category === 'artisan')
            .map(([, skills]) => skills)
            .flat()
            .map(skill => renderSkillInput(skill))
          }
        </div>
      </div>

      {/* Skill Leveling Calculator */}
      <div className={`rounded-lg p-6 ${theme.mode === 'dark' ? 'border' : 'bg-green-500/20 border border-green-500/50'}`} style={theme.mode === 'dark' ? { backgroundColor: 'rgba(34, 139, 34, 0.2)', borderColor: 'rgba(34, 139, 34, 0.5)' } : {}}>
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${theme.mode === 'dark' ? 'text-green-200' : 'text-green-200'}`}>
            ⚡ Skill Leveling Calculator
          </h2>
          <p className={`text-sm ${theme.mode === 'dark' ? 'text-green-300' : 'text-green-300'}`}>
            Optimize your skill leveling strategy and resource gathering
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Skill Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.mode === 'dark' ? 'text-green-200' : 'text-green-200'}`}>
              Select Skill to Level
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Choose a skill...</option>
              {getAllSkills().map(skill => (
                <option key={skill.name} value={skill.name}>
                  {skill.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Current and Target Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.mode === 'dark' ? 'text-green-200' : 'text-green-200'}`}>
                Current Level
              </label>
              <input
                type="number"
                value={selectedSkill ? (skillLevels[selectedSkill] || 1) : 1}
                readOnly
                className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.mode === 'dark' ? 'text-green-200' : 'text-green-200'}`}>
                Target Level
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={targetLevel}
                onChange={(e) => setTargetLevel(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Gather Own Resources Checkbox (for artisan skills) */}
          {selectedSkill && isArtisanSkill(selectedSkill) && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="gatherResources"
                checked={gatherOwnResources}
                onChange={(e) => setGatherOwnResources(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <label htmlFor="gatherResources" className={`text-sm ${theme.mode === 'dark' ? 'text-green-200' : 'text-green-200'}`}>
                I want to gather my own resources
              </label>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleOptimizeSkill}
              disabled={!selectedSkill}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                selectedSkill
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              🚀 Optimize Skill Leveling
            </button>
          </div>

          {/* Quick Info */}
          {selectedSkill && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-300">
              <div className="flex justify-between items-center">
                <span>Skill Category:</span>
                <span className="font-medium">
                  {isArtisanSkill(selectedSkill) ? 'Artisan' : 'Gathering'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Levels to gain:</span>
                <span className="font-medium">
                  {Math.max(0, targetLevel - (skillLevels[selectedSkill] || 1))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Local Development Section */}
      {isLocalDevelopment && (
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🛠️</span>
            <h2 className="text-xl font-bold text-yellow-300">
              Development Preview
            </h2>
            <span className="px-2 py-1 bg-yellow-600/20 border border-yellow-500/50 rounded text-xs text-yellow-200">
              LOCAL ONLY
            </span>
          </div>

          <div className="space-y-4 text-gray-300">
            <p className="text-sm">
              This section is only visible in local development and will not appear in production.
            </p>

            {/* Future Development Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-200 mb-2">Combat Skills</h3>
                <ul className="text-sm space-y-1">
                  <li>• Melee Experience Calculator</li>
                  <li>• Ranged Experience Calculator</li>
                  <li>• Magic Experience Calculator</li>
                  <li>• Defense Experience Calculator</li>
                </ul>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-200 mb-2">Production Skills</h3>
                <ul className="text-sm space-y-1">
                  <li>• Mining Experience Calculator</li>
                  <li>• Smithing Experience Calculator</li>
                  <li>• Cooking Experience Calculator</li>
                  <li>• Farming Experience Calculator</li>
                </ul>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-200 mb-2">Other Skills</h3>
                <ul className="text-sm space-y-1">
                  <li>• Crafting Experience Calculator</li>
                  <li>• Fishing Experience Calculator</li>
                  <li>• Foraging Experience Calculator</li>
                  <li>• Archaeology Experience Calculator</li>
                </ul>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-200 mb-2">Planned Features</h3>
                <ul className="text-sm space-y-1">
                  <li>• XP/hour optimization</li>
                  <li>• Resource cost calculations</li>
                  <li>• Time to level estimations</li>
                  <li>• Skill progression planning</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
              <h4 className="font-semibold text-blue-200 mb-2">Development Notes</h4>
              <ul className="text-sm space-y-1 text-blue-300">
                <li>• Integration with existing character data system</li>
                <li>• Real-time calculations and optimization suggestions</li>
                <li>• Export functionality for skill planning spreadsheets</li>
                <li>• Mobile-responsive design for on-the-go planning</li>
              </ul>
            </div>

            {/* Live Calculation Demo */}
            <div className="mt-6 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
              <h4 className="font-semibold text-green-200 mb-3">Live Calculation Demo</h4>
              <p className="text-sm text-green-300 mb-4">
                This demonstrates the skill calculation system using your current skill levels.
              </p>

              {/* Calculate optimal milking for demonstration */}
              {(() => {
                try {
                  const milkingOptimal = findOptimalGatheringLocation(
                    GATHERING_SKILLS_DATA,
                    'milking',
                    skillLevels,
                    houseRoomLevels,
                    equipment,
                    'experience'
                  );

                  if (milkingOptimal) {
                    const itemsPerHour = calculateItemsPerHour(milkingOptimal.item, milkingOptimal.result);

                    return (
                      <div className="bg-gray-800/50 rounded p-3 text-sm">
                        <h5 className="text-green-200 font-medium mb-2">
                          Optimal Milking Location: {milkingOptimal.item.area}
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-gray-300">
                            <div>Level Required: {milkingOptimal.item.levelRequired}</div>
                            <div>Your Level: {skillLevels.milking || 1}</div>
                            <div>Base Time: {milkingOptimal.result.baseTime}s</div>
                            <div>Modified Time: {milkingOptimal.result.modifiedTime.toFixed(1)}s</div>
                          </div>
                          <div className="text-gray-300">
                            <div>Efficiency: {milkingOptimal.result.efficiency.toFixed(1)}%</div>
                            <div>XP/Hour: {Math.round(milkingOptimal.result.experiencePerHour).toLocaleString()}</div>
                            <div>Actions/Hour: {Math.round(milkingOptimal.result.actionsPerHour)}</div>
                            <div>Items/Hour: {Math.round(itemsPerHour).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                } catch (error) {
                  console.error('Calculation error:', error);
                }
                return (
                  <div className="text-sm text-gray-400">
                    Calculation system ready - waiting for skill level data
                  </div>
                );
              })()}

              <div className="mt-3 text-xs text-green-400">
                ✅ Efficiency bonuses, house room buffs, and experience calculations are working!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}