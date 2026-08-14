import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, TranslationKeys } from '@/i18n/translations';

export type Language = 'ar' | 'en';

interface LanguageState {
  language: Language;
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ar',
      direction: 'rtl',
      setLanguage: (lang: Language) => {
        const direction = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', direction);
        document.documentElement.setAttribute('lang', lang);
        set({ language: lang, direction });
      },
      toggleLanguage: () => {
        const nextLang = get().language === 'ar' ? 'en' : 'ar';
        get().setLanguage(nextLang);
      },
      t: (key: TranslationKeys, params?: Record<string, string | number>) => {
        const lang = get().language;
        let text: string = translations[lang]?.[key] || translations['ar']?.[key] || (key as string);
        if (params) {
          Object.entries(params).forEach(([paramKey, paramVal]) => {
            text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal));
          });
        }
        return text;
      },
    }),
    {
      name: 'wallsshop-language-preference',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const dir = state.language === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.setAttribute('dir', dir);
          document.documentElement.setAttribute('lang', state.language);
        }
      },
    }
  )
);
