'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enMessages from '@/../messages/en.json';
import frMessages from '@/../messages/fr.json';

type Locale = 'en' | 'fr';
type Messages = typeof enMessages;

const messages: Record<Locale, Messages> = {
  en: enMessages,
  fr: frMessages,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isReady: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with 'en' to match server rendering
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // After mount, load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'fr')) {
      setLocaleState(savedLocale);
    }
    // Small delay to ensure hydration is complete
    requestAnimationFrame(() => {
      setIsReady(true);
    });
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isReady }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Return default values during SSR or if provider is not available
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: string) => key,
      isReady: false,
    };
  }
  return context;
}

