export type Skills = 'Strength' | 'Evasion' | 'Speed';

export type CharacterSkills = { [key in Skills]?: number };

// TODO implement skills, and add skills to ai based on level.