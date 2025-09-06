import React, { createContext, useContext, useEffect, useState, useMemo } from 'https://aistudiocdn.com/react@^19.1.1';
import { Reading, Settings, Theme, Language, Tariff } from '../types.ts';
import useLocalStorage from '../hooks/useLocalStorage.ts';
import { DEFAULT_MOROCCAN_TARIFFS } from '../constants.ts';

type Translations = Record<Language, Record<string, string>>;

interface AppContextType {
  readings: Reading[];
  addReading: (reading: Omit<Reading, 'id'>) => void;
  updateReading: (reading: Reading) => void;
  deleteReading: (id: string) => void;
  clearReadings: () => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [readings, setReadings] = useLocalStorage<Reading[]>('tricinty-readings', []);
  const [settings, setSettings] = useLocalStorage<Settings>('tricinty-settings', {
    theme: 'light',
    language: 'en',
    tariffs: DEFAULT_MOROCCAN_TARIFFS,
    currency: 'MAD',
    monthlyGoal: 0,
  });

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enRes, frRes, arRes] = await Promise.all([
          fetch('./i18n/en.json'),
          fetch('./i18n/fr.json'),
          fetch('./i18n/ar.json'),
        ]);

        if (!enRes.ok || !frRes.ok || !arRes.ok) {
          throw new Error('Failed to fetch translation files');
        }
        
        const en = await enRes.json();
        const fr = await frRes.json();
        const ar = await arRes.json();
        setTranslations({ en, fr, ar });
      } catch (error) {
        console.error("Failed to load translations:", error);
        // Attempt to load at least English as a fallback
        try {
            const enRes = await fetch('./i18n/en.json');
            const en = await enRes.json();
            setTranslations({ en, fr: en, ar: en });
        } catch (fallbackError) {
            console.error("Failed to load fallback English translation:", fallbackError);
        }
      }
    };

    fetchTranslations();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(settings.theme === 'light' ? 'dark' : 'light');
    root.classList.add(settings.theme);
    root.lang = settings.language;
    root.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings.theme, settings.language]);

  const addReading = (reading: Omit<Reading, 'id'>) => {
    const newReading: Reading = { id: new Date().toISOString(), ...reading };
    const sortedReadings = [...readings, newReading].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setReadings(sortedReadings);
  };
  
  const updateReading = (updatedReading: Reading) => {
    const updatedReadings = readings.map(r => r.id === updatedReading.id ? updatedReading : r);
    const sortedReadings = updatedReadings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setReadings(sortedReadings);
  };

  const deleteReading = (id: string) => {
    setReadings(readings.filter(r => r.id !== id));
  };
  
  const clearReadings = () => {
    setReadings([]);
  };

  const setTheme = (theme: Theme) => {
    setSettings(s => ({...s, theme}));
  }

  const setLanguage = (lang: Language) => {
    setSettings(s => ({...s, language: lang}));
  }

  const setCurrency = (currency: string) => {
    setSettings(s => ({...s, currency}));
  }

  const t = (key: string): string => {
    if (!translations) {
      return key;
    }
    const langDict = translations[settings.language];
    const fallbackDict = translations.en;
    return langDict?.[key] || fallbackDict?.[key] || key;
  };

  const contextValue = useMemo(() => ({
    readings,
    addReading,
    updateReading,
    deleteReading,
    clearReadings,
    settings,
    setSettings,
    theme: settings.theme,
    setTheme,
    language: settings.language,
    setLanguage,
    currency: settings.currency,
    setCurrency,
    t
  }), [readings, settings, translations]);

  if (!translations) {
    return (
      <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};