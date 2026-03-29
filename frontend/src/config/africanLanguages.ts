// App languages: English, French, and Ghana languages only (Ghana-focused SRHR platform)

export interface AfricanLanguage {
  code: string;
  name: string;
  nativeName: string;
  region: 'West' | 'East' | 'Central' | 'Southern' | 'North' | 'All';
  speakers: number; // Approximate in millions
}

export const AFRICAN_LANGUAGES: AfricanLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'West', speakers: 200 },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'West', speakers: 120 },
  { code: 'tw', name: 'Twi', nativeName: 'Twi', region: 'West', speakers: 18 },
  { code: 'ga', name: 'Ga', nativeName: 'Ga', region: 'West', speakers: 1 },
  { code: 'ewe', name: 'Ewe', nativeName: 'Eʋegbe', region: 'West', speakers: 7 },
  { code: 'dag', name: 'Dagbani', nativeName: 'Dagbani', region: 'West', speakers: 3 },
  { code: 'fante', name: 'Fante', nativeName: 'Fante', region: 'West', speakers: 4 },
  { code: 'bassa', name: 'Bassa', nativeName: 'Bassa', region: 'West', speakers: 0.5 },
  { code: 'kpelle', name: 'Kpelle', nativeName: 'Kpelle', region: 'West', speakers: 1.5 },
  { code: 'kru', name: 'Kru', nativeName: 'Kru', region: 'West', speakers: 0.3 },
  { code: 'vai', name: 'Vai', nativeName: 'Vai', region: 'West', speakers: 0.2 }
];

// Get languages by region
export const getLanguagesByRegion = (region: string): AfricanLanguage[] => {
  if (region === 'All') return AFRICAN_LANGUAGES;
  return AFRICAN_LANGUAGES.filter(lang => lang.region === region || lang.region === 'All');
};

// Get most spoken languages
export const getMostSpokenLanguages = (limit: number = 20): AfricanLanguage[] => {
  return [...AFRICAN_LANGUAGES]
    .sort((a, b) => b.speakers - a.speakers)
    .slice(0, limit);
};

// Get language by code
export const getLanguageByCode = (code: string): AfricanLanguage | undefined => {
  return AFRICAN_LANGUAGES.find(lang => lang.code === code);
};

// App-supported languages: English, French, and Ghana languages only
export const APP_LANGUAGES: AfricanLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'West', speakers: 200 },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'West', speakers: 120 },
  { code: 'tw', name: 'Twi', nativeName: 'Twi', region: 'West', speakers: 18 },
  { code: 'ga', name: 'Ga', nativeName: 'Ga', region: 'West', speakers: 1 },
  { code: 'ewe', name: 'Ewe', nativeName: 'Eʋegbe', region: 'West', speakers: 7 },
  { code: 'dag', name: 'Dagbani', nativeName: 'Dagbani', region: 'West', speakers: 3 },
  { code: 'fante', name: 'Fante', nativeName: 'Fante', region: 'West', speakers: 4 },
  { code: 'bassa', name: 'Bassa', nativeName: 'Bassa', region: 'West', speakers: 0.5 },
  { code: 'kpelle', name: 'Kpelle', nativeName: 'Kpelle', region: 'West', speakers: 1.5 },
  { code: 'kru', name: 'Kru', nativeName: 'Kru', region: 'West', speakers: 0.3 },
  { code: 'vai', name: 'Vai', nativeName: 'Vai', region: 'West', speakers: 0.2 }
];

