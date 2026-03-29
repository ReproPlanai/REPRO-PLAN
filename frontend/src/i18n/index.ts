import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import kpelle from './locales/kpelle.json';
import bassa from './locales/bassa.json';
import kru from './locales/kru.json';
import vai from './locales/vai.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  tw: { translation: en },   // Twi - fallback to en until translations available
  ga: { translation: en },   // Ga - fallback to en until translations available
  ewe: { translation: en }, // Ewe - fallback to en until translations available
  dag: { translation: en }, // Dagbani - fallback to en until translations available
  fante: { translation: en }, // Fante - fallback to en until translations available
  kpelle: { translation: kpelle },
  bassa: { translation: bassa },
  kru: { translation: kru },
  vai: { translation: vai },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
