'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { LANGUAGES, type Language, useT } from '@/lib/i18n';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = 'language-switcher' }) => {
  const { language, setLanguage, t } = useT();
  return (
    <label className={className}>
      <Languages size={15} aria-hidden="true" />
      <span className="sr-only">{t('Language')}</span>
      <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>{l.native}</option>
        ))}
      </select>
    </label>
  );
};
