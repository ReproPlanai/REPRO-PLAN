// Country configuration for REPRO PLAN
// Starting with Ghana, expanding to West Africa, then all of Africa

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
  currency: string;
  defaultLanguage: string;
  languages: { code: string; name: string; nativeName: string }[];
  regions: { code: string; name: string }[];
  defaultCoordinates: { lat: number; lng: number };
  defaultCity: string;
  emergencyNumbers: {
    police: string;
    medical: string;
    fire: string;
    gbv: string;
  };
  isActive: boolean;
  launchDate?: string;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  GH: {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    phoneCode: '+233',
    currency: 'GHS',
    defaultLanguage: 'en',
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'tw', name: 'Twi', nativeName: 'Twi' },
      { code: 'ga', name: 'Ga', nativeName: 'Ga' },
      { code: 'ewe', name: 'Ewe', nativeName: 'Eʋegbe' },
      { code: 'dag', name: 'Dagbani', nativeName: 'Dagbani' },
      { code: 'fante', name: 'Fante', nativeName: 'Fante' }
    ],
    regions: [
      { code: 'AH', name: 'Ahafo' },
      { code: 'AS', name: 'Ashanti' },
      { code: 'BA', name: 'Bono' },
      { code: 'BE', name: 'Bono East' },
      { code: 'CE', name: 'Central' },
      { code: 'EA', name: 'Eastern' },
      { code: 'GA', name: 'Greater Accra' },
      { code: 'NE', name: 'North East' },
      { code: 'NO', name: 'Northern' },
      { code: 'OT', name: 'Oti' },
      { code: 'SA', name: 'Savannah' },
      { code: 'UE', name: 'Upper East' },
      { code: 'UW', name: 'Upper West' },
      { code: 'VO', name: 'Volta' },
      { code: 'WE', name: 'Western' },
      { code: 'WN', name: 'Western North' }
    ],
    defaultCoordinates: { lat: 5.6037, lng: -0.1870 }, // Accra
    defaultCity: 'Accra',
    emergencyNumbers: {
      police: '191',
      medical: '193',
      fire: '192',
      gbv: '0800-800-800'
    },
    isActive: true,
    launchDate: '2024-01-01'
  },
  // West African countries (to be activated)
  NG: {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    phoneCode: '+234',
    currency: 'NGN',
    defaultLanguage: 'en',
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
      { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
      { code: 'ig', name: 'Igbo', nativeName: 'Igbo' }
    ],
    regions: [
      { code: 'AB', name: 'Abia' },
      { code: 'AD', name: 'Adamawa' },
      { code: 'AK', name: 'Akwa Ibom' },
      { code: 'AN', name: 'Anambra' },
      { code: 'BA', name: 'Bauchi' },
      { code: 'BY', name: 'Bayelsa' },
      { code: 'BE', name: 'Benue' },
      { code: 'BO', name: 'Borno' },
      { code: 'CR', name: 'Cross River' },
      { code: 'DE', name: 'Delta' },
      { code: 'EB', name: 'Ebonyi' },
      { code: 'ED', name: 'Edo' },
      { code: 'EK', name: 'Ekiti' },
      { code: 'EN', name: 'Enugu' },
      { code: 'GO', name: 'Gombe' },
      { code: 'IM', name: 'Imo' },
      { code: 'JI', name: 'Jigawa' },
      { code: 'KD', name: 'Kaduna' },
      { code: 'KN', name: 'Kano' },
      { code: 'KT', name: 'Katsina' },
      { code: 'KE', name: 'Kebbi' },
      { code: 'KO', name: 'Kogi' },
      { code: 'KW', name: 'Kwara' },
      { code: 'LA', name: 'Lagos' },
      { code: 'NA', name: 'Nasarawa' },
      { code: 'NI', name: 'Niger' },
      { code: 'OG', name: 'Ogun' },
      { code: 'ON', name: 'Ondo' },
      { code: 'OS', name: 'Osun' },
      { code: 'OY', name: 'Oyo' },
      { code: 'PL', name: 'Plateau' },
      { code: 'RI', name: 'Rivers' },
      { code: 'SO', name: 'Sokoto' },
      { code: 'TA', name: 'Taraba' },
      { code: 'YO', name: 'Yobe' },
      { code: 'ZA', name: 'Zamfara' },
      { code: 'FC', name: 'FCT Abuja' }
    ],
    defaultCoordinates: { lat: 6.5244, lng: 3.3792 }, // Lagos
    defaultCity: 'Lagos',
    emergencyNumbers: {
      police: '199',
      medical: '199',
      fire: '199',
      gbv: '0800-800-800'
    },
    isActive: false
  },
  SN: {
    code: 'SN',
    name: 'Senegal',
    flag: '🇸🇳',
    phoneCode: '+221',
    currency: 'XOF',
    defaultLanguage: 'fr',
    languages: [
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'wo', name: 'Wolof', nativeName: 'Wolof' },
      { code: 'ff', name: 'Fula', nativeName: 'Fulfulde' }
    ],
    regions: [
      { code: 'DK', name: 'Dakar' },
      { code: 'TH', name: 'Thiès' },
      { code: 'DI', name: 'Diourbel' },
      { code: 'FK', name: 'Fatick' },
      { code: 'KA', name: 'Kaffrine' },
      { code: 'KD', name: 'Kédougou' },
      { code: 'KL', name: 'Kolda' },
      { code: 'LG', name: 'Louga' },
      { code: 'MT', name: 'Matam' },
      { code: 'SL', name: 'Saint-Louis' },
      { code: 'SE', name: 'Sédhiou' },
      { code: 'TC', name: 'Tambacounda' },
      { code: 'ZG', name: 'Ziguinchor' }
    ],
    defaultCoordinates: { lat: 14.7167, lng: -17.4677 }, // Dakar
    defaultCity: 'Dakar',
    emergencyNumbers: {
      police: '17',
      medical: '15',
      fire: '18',
      gbv: '800-00-11'
    },
    isActive: false
  },
  CI: {
    code: 'CI',
    name: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    phoneCode: '+225',
    currency: 'XOF',
    defaultLanguage: 'fr',
    languages: [
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'dy', name: 'Dyula', nativeName: 'Dioula' },
      { code: 'ba', name: 'Baoulé', nativeName: 'Baoulé' }
    ],
    regions: [
      { code: 'AB', name: 'Abidjan' },
      { code: 'BS', name: 'Bas-Sassandra' },
      { code: 'CM', name: 'Comoé' },
      { code: 'DN', name: 'Denguélé' },
      { code: 'GD', name: 'Gôh-Djiboua' },
      { code: 'LC', name: 'Lacs' },
      { code: 'LG', name: 'Lagunes' },
      { code: 'MG', name: 'Montagnes' },
      { code: 'SM', name: 'Sassandra-Marahoué' },
      { code: 'SV', name: 'Savanes' },
      { code: 'VB', name: 'Vallée du Bandama' },
      { code: 'WR', name: 'Woroba' },
      { code: 'YM', name: 'Yamoussoukro' },
      { code: 'ZZ', name: 'Zanzan' }
    ],
    defaultCoordinates: { lat: 5.3600, lng: -4.0083 }, // Abidjan
    defaultCity: 'Abidjan',
    emergencyNumbers: {
      police: '111',
      medical: '185',
      fire: '180',
      gbv: '800-00-11'
    },
    isActive: false
  }
};

// Get current country (defaults to Ghana)
export const getCurrentCountry = (): CountryConfig => {
  const stored = localStorage.getItem('reproplan_country');
  if (stored && COUNTRIES[stored] && COUNTRIES[stored].isActive) {
    return COUNTRIES[stored];
  }
  return COUNTRIES.GH; // Default to Ghana
};

// Set current country
export const setCurrentCountry = (countryCode: string): void => {
  if (COUNTRIES[countryCode] && COUNTRIES[countryCode].isActive) {
    localStorage.setItem('reproplan_country', countryCode);
  }
};

// Get active countries
export const getActiveCountries = (): CountryConfig[] => {
  return Object.values(COUNTRIES).filter(country => country.isActive);
};

// Get West African countries
export const getWestAfricanCountries = (): CountryConfig[] => {
  const westAfricaCodes = ['GH', 'NG', 'SN', 'CI', 'ML', 'BF', 'NE', 'TD', 'MR', 'GM', 'GW', 'GN', 'SL', 'LR', 'TG', 'BJ'];
  return westAfricaCodes
    .map(code => COUNTRIES[code])
    .filter(country => country !== undefined);
};

