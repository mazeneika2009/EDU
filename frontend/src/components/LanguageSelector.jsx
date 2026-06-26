import React from 'react';
import { Globe } from 'lucide-react';

export function LanguageSelector({ currentLang, onLanguageChange }) {
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'AR' },
    { code: 'tr', label: 'TR' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-purple-400" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
            currentLang === lang.code
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-gray-500 hover:text-gray-300 border border-transparent'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
