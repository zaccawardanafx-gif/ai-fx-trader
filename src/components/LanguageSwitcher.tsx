'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n-provider';
import { Globe } from 'lucide-react';

const locales = ['en', 'fr'] as const;
type Locale = typeof locales[number];

const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{localeNames[locale as Locale]}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50 border border-slate-200 animate-fadeIn">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                locale === loc
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
