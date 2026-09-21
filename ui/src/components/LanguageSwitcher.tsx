import { useTranslation } from 'react-i18next';

const locales = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const setLocale = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('cyberx-locale', code);
    document.documentElement.lang = code;
  };

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {locales.map((loc) => (
        <button
          key={loc.code}
          type="button"
          onClick={() => setLocale(loc.code)}
          className={`lang-switcher__btn${i18n.language === loc.code ? ' lang-switcher__btn--active' : ''}`}
        >
          {loc.label}
        </button>
      ))}
    </div>
  );
}
