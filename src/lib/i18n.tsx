'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LANGUAGE_STORAGE_KEY } from './i18n-boot';

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
] as const;
export type Language = (typeof LANGUAGES)[number]['code'];
// Keyed by the English text; {name} marks a value filled in at runtime
export type Dictionary = Record<string, string>;
type Vars = Record<string, string | number>;

// Marks text kept in lists or constants for translation; it is translated where it is shown with t()
export const msg = (text: string) => text;

const isLanguage = (value: unknown): value is Language => LANGUAGES.some((l) => l.code === value);

// Each language is its own chunk, so visitors only download the one they pick
const loaders: Record<Exclude<Language, 'en'>, () => Promise<{ default: Dictionary }>> = {
  kn: () => import('./translations/kn.json'),
  ta: () => import('./translations/ta.json'),
  te: () => import('./translations/te.json'),
  ml: () => import('./translations/ml.json'),
  hi: () => import('./translations/hi.json'),
};

const fill = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match)) : text;

type Pattern = { key: string; names: string[]; regex: RegExp };
// Messages built at runtime (mostly from the store) already have their values filled in,
// so they are matched against the keys that have {placeholders}
const buildPatterns = (dictionary: Dictionary): Pattern[] =>
  Object.keys(dictionary).filter((key) => key.includes('{')).map((key) => {
    const names: string[] = [];
    const source = key.split(/\{(\w+)\}/).map((part, index) => {
      if (index % 2) { names.push(part); return '(.+?)'; }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
    return { key, names, regex: new RegExp(`^${source}$`, 's') };
  });

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  // Translates English text; values in vars replace {name} placeholders
  t: (text: string, vars?: Vars) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [chosen, setChosen] = useState<Language>('en');
  const [dictionary, setDictionary] = useState<{ language: Language; entries: Dictionary; patterns: Pattern[] }>({ language: 'en', entries: {}, patterns: [] });
  // The staff panel is English only
  const language: Language = pathname.startsWith('/admin') ? 'en' : chosen;

  useEffect(() => {
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY); } catch {}
    // Reading storage after hydration keeps the first render identical to the server's
    if (isLanguage(saved)) setChosen(saved); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    let active = true;
    const root = document.documentElement;
    const done = () => root.classList.remove('i18n-loading');
    root.lang = language;
    if (language === 'en' || dictionary.language === language) { done(); return; }
    loaders[language]()
      .then(({ default: entries }) => { if (active) setDictionary({ language, entries, patterns: buildPatterns(entries) }); })
      .catch(done);
    return () => { active = false; };
  }, [language, dictionary.language]);

  const setLanguage = useCallback((next: Language) => {
    try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch {}
    setChosen(next);
  }, []);

  const t = useCallback((text: string, vars?: Vars) => {
    if (language === 'en' || dictionary.language !== language) return fill(text, vars);
    const exact = dictionary.entries[text];
    if (exact !== undefined) return fill(exact, vars);
    if (!vars) {
      for (const { key, names, regex } of dictionary.patterns) {
        const match = regex.exec(text);
        if (!match) continue;
        const values = Object.fromEntries(names.map((name, i) => [name, dictionary.entries[match[i + 1]] ?? match[i + 1]]));
        return fill(dictionary.entries[key], values);
      }
    }
    return fill(text, vars);
  }, [language, dictionary]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useT = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useT must be used within an I18nProvider');
  return context;
};

// For sentences with an element inside: the whole sentence is one key, so translations can reorder it
export const Trans: React.FC<{ text: string; values: Record<string, React.ReactNode> }> = ({ text, values }) => {
  const { t } = useT();
  const parts = t(text).split(/\{(\w+)\}/);
  return <>{parts.map((part, i) => (i % 2 ? <React.Fragment key={i}>{values[part]}</React.Fragment> : part))}</>;
};
