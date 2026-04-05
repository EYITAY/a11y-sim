import React from 'react';

type Translations = Record<string, string>;

type I18nContextValue = {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
};

const resources: Record<string, Translations> = {
  en: {
    footer_copyright: 'A11y Sim. A Community Freeware.',
    footer_privacy_policy: 'Privacy Policy',
    footer_terms_of_use: 'Terms of Use',
    footer_refund_policy: 'Refund Policy',
    footer_donation_policy: 'Donation Policy',
    footer_eu_visitors: 'EU Visitors',
    footer_california_visitors: 'California Visitors',
    footer_report_a_bug: 'Report a bug',
  },
};

const fallbackT = (key: string) => key;

const I18nContext = React.createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: fallbackT,
});

export const I18nProvider: React.FC<{ children: React.ReactNode; initialLang?: string }> = ({
  children,
  initialLang = 'en',
}) => {
  const [lang, setLang] = React.useState(initialLang);

  const t = React.useCallback(
    (key: string) => {
      const table = resources[lang] ?? resources.en;
      return table?.[key] ?? resources.en?.[key] ?? key;
    },
    [lang]
  );

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const { t, lang, setLang } = React.useContext(I18nContext);
  return { t, i18n: { language: lang, changeLanguage: setLang } };
};
