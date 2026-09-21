import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import en from './locales/en.json';

const savedLocale = localStorage.getItem('cyberx-locale') ?? 'ru';

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: savedLocale,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

document.documentElement.lang = savedLocale;

export default i18n;
