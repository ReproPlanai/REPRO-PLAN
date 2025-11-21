// Comprehensive list of major African languages for REPRO PLAN
// Organized by region for better organization

export interface AfricanLanguage {
  code: string;
  name: string;
  nativeName: string;
  region: 'West' | 'East' | 'Central' | 'Southern' | 'North' | 'All';
  speakers: number; // Approximate in millions
}

export const AFRICAN_LANGUAGES: AfricanLanguage[] = [
  // West Africa
  { code: 'en', name: 'English', nativeName: 'English', region: 'West', speakers: 200 },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'West', speakers: 120 },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', region: 'West', speakers: 85 },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', region: 'West', speakers: 45 },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', region: 'West', speakers: 30 },
  { code: 'tw', name: 'Twi', nativeName: 'Twi', region: 'West', speakers: 18 },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof', region: 'West', speakers: 12 },
  { code: 'ff', name: 'Fula', nativeName: 'Fulfulde', region: 'West', speakers: 25 },
  { code: 'ga', name: 'Ga', nativeName: 'Ga', region: 'West', speakers: 1 },
  { code: 'ewe', name: 'Ewe', nativeName: 'Eʋegbe', region: 'West', speakers: 7 },
  { code: 'dag', name: 'Dagbani', nativeName: 'Dagbani', region: 'West', speakers: 3 },
  { code: 'fante', name: 'Fante', nativeName: 'Fante', region: 'West', speakers: 4 },
  { code: 'dy', name: 'Dyula', nativeName: 'Dioula', region: 'West', speakers: 15 },
  { code: 'ba', name: 'Baoulé', nativeName: 'Baoulé', region: 'West', speakers: 5 },
  { code: 'bassa', name: 'Bassa', nativeName: 'Bassa', region: 'West', speakers: 0.5 },
  { code: 'kpelle', name: 'Kpelle', nativeName: 'Kpelle', region: 'West', speakers: 1.5 },
  { code: 'kru', name: 'Kru', nativeName: 'Kru', region: 'West', speakers: 0.3 },
  { code: 'vai', name: 'Vai', nativeName: 'Vai', region: 'West', speakers: 0.2 },
  { code: 'mand', name: 'Mandinka', nativeName: 'Mandinka', region: 'West', speakers: 1.5 },
  { code: 'sus', name: 'Susu', nativeName: 'Susu', region: 'West', speakers: 1 },
  { code: 'tem', name: 'Temne', nativeName: 'Temne', region: 'West', speakers: 2 },
  { code: 'lim', name: 'Limba', nativeName: 'Limba', region: 'West', speakers: 0.5 },
  
  // East Africa
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', region: 'East', speakers: 200 },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', region: 'East', speakers: 32 },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', region: 'East', speakers: 20 },
  { code: 'om', name: 'Oromo', nativeName: 'Oromoo', region: 'East', speakers: 37 },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', region: 'East', speakers: 7 },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', region: 'East', speakers: 12 },
  { code: 'rn', name: 'Kirundi', nativeName: 'Kirundi', region: 'East', speakers: 9 },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda', region: 'East', speakers: 8 },
  { code: 'luo', name: 'Luo', nativeName: 'Dholuo', region: 'East', speakers: 4 },
  { code: 'kik', name: 'Kikuyu', nativeName: 'Gĩkũyũ', region: 'East', speakers: 7 },
  { code: 'ach', name: 'Acholi', nativeName: 'Acholi', region: 'East', speakers: 1.5 },
  
  // Central Africa
  { code: 'ln', name: 'Lingala', nativeName: 'Lingála', region: 'Central', speakers: 20 },
  { code: 'kg', name: 'Kongo', nativeName: 'Kikongo', region: 'Central', speakers: 7 },
  { code: 'sg', name: 'Sango', nativeName: 'Sängö', region: 'Central', speakers: 5 },
  { code: 'ts', name: 'Tshiluba', nativeName: 'Tshiluba', region: 'Central', speakers: 6 },
  { code: 'bem', name: 'Bemba', nativeName: 'Chibemba', region: 'Central', speakers: 4 },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa', region: 'Central', speakers: 12 },
  
  // Southern Africa
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', region: 'Southern', speakers: 12 },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', region: 'Southern', speakers: 8 },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', region: 'Southern', speakers: 7 },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', region: 'Southern', speakers: 5 },
  { code: 'st', name: 'Sotho', nativeName: 'Sesotho', region: 'Southern', speakers: 5 },
  { code: 've', name: 'Venda', nativeName: 'Tshivenda', region: 'Southern', speakers: 1.2 },
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', region: 'Southern', speakers: 3 },
  { code: 'ss', name: 'Swati', nativeName: 'SiSwati', region: 'Southern', speakers: 1.5 },
  { code: 'nr', name: 'Ndebele', nativeName: 'isiNdebele', region: 'Southern', speakers: 1.5 },
  { code: 'nd', name: 'Northern Ndebele', nativeName: 'isiNdebele', region: 'Southern', speakers: 1.5 },
  
  // North Africa
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'North', speakers: 150 },
  { code: 'ber', name: 'Berber', nativeName: 'Tamazight', region: 'North', speakers: 30 },
  
  // Portuguese (Angola, Mozambique, etc.)
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'Southern', speakers: 20 }
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

