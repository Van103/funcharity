import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AngelTheme {
  id: string;
  name: string;
  bgImage: string;
  headerBg: string;
  bodyBg: string;
  inputBg: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  buttonGradient: string;
  userMsgBg: string;
  assistantMsgBg: string;
}

export const ANGEL_THEMES: AngelTheme[] = [
  {
    id: 'lavender',
    name: 'Lavender',
    bgImage: '/images/angel-bg-lavender.png',
    headerBg: 'bg-gradient-to-r from-purple-200/90 to-violet-200/90',
    bodyBg: 'bg-purple-100/80',
    inputBg: 'bg-white/70',
    borderColor: 'border-purple-300/50',
    textPrimary: 'text-purple-900',
    textSecondary: 'text-purple-600',
    buttonGradient: 'from-purple-500 to-violet-500',
    userMsgBg: 'bg-gradient-to-br from-purple-400 to-violet-500',
    assistantMsgBg: 'bg-white/80',
  },
  {
    id: 'purple',
    name: 'Tím Pastel',
    bgImage: '/images/angel-bg-purple.png',
    headerBg: 'bg-gradient-to-r from-purple-400/90 to-violet-400/90',
    bodyBg: 'bg-purple-300/70',
    inputBg: 'bg-white/60',
    borderColor: 'border-purple-400/50',
    textPrimary: 'text-purple-950',
    textSecondary: 'text-purple-700',
    buttonGradient: 'from-purple-600 to-violet-600',
    userMsgBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
    assistantMsgBg: 'bg-white/90',
  },
  {
    id: 'violet',
    name: 'Tím Đậm',
    bgImage: '/images/angel-bg-violet.png',
    headerBg: 'bg-gradient-to-r from-purple-700/95 to-violet-700/95',
    bodyBg: 'bg-purple-800/80',
    inputBg: 'bg-purple-900/60',
    borderColor: 'border-purple-500/40',
    textPrimary: 'text-white',
    textSecondary: 'text-purple-200',
    buttonGradient: 'from-amber-500 to-yellow-500',
    userMsgBg: 'bg-gradient-to-br from-purple-600 to-indigo-600',
    assistantMsgBg: 'bg-purple-900/70',
  },
  {
    id: 'white',
    name: 'Trắng Hồng',
    bgImage: '/images/angel-bg-white.png',
    headerBg: 'bg-gradient-to-r from-pink-100/90 to-purple-100/90',
    bodyBg: 'bg-white/70',
    inputBg: 'bg-purple-50/80',
    borderColor: 'border-pink-200/50',
    textPrimary: 'text-purple-900',
    textSecondary: 'text-pink-600',
    buttonGradient: 'from-pink-400 to-purple-500',
    userMsgBg: 'bg-gradient-to-br from-pink-400 to-purple-500',
    assistantMsgBg: 'bg-white/90',
  },
  {
    id: 'rose',
    name: 'Hồng Sen',
    bgImage: '/images/angel-bg-lavender.png',
    headerBg: 'bg-gradient-to-r from-rose-200/90 to-pink-200/90',
    bodyBg: 'bg-rose-100/80',
    inputBg: 'bg-white/70',
    borderColor: 'border-rose-300/50',
    textPrimary: 'text-rose-900',
    textSecondary: 'text-rose-600',
    buttonGradient: 'from-rose-500 to-pink-500',
    userMsgBg: 'bg-gradient-to-br from-rose-400 to-pink-500',
    assistantMsgBg: 'bg-white/80',
  },
  {
    id: 'sky',
    name: 'Xanh Dương',
    bgImage: '/images/angel-bg-lavender.png',
    headerBg: 'bg-gradient-to-r from-sky-200/90 to-blue-200/90',
    bodyBg: 'bg-sky-100/80',
    inputBg: 'bg-white/70',
    borderColor: 'border-sky-300/50',
    textPrimary: 'text-sky-900',
    textSecondary: 'text-sky-600',
    buttonGradient: 'from-sky-500 to-blue-500',
    userMsgBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
    assistantMsgBg: 'bg-white/80',
  },
  {
    id: 'mint',
    name: 'Xanh Bạc Hà',
    bgImage: '/images/angel-bg-lavender.png',
    headerBg: 'bg-gradient-to-r from-emerald-200/90 to-teal-200/90',
    bodyBg: 'bg-emerald-100/80',
    inputBg: 'bg-white/70',
    borderColor: 'border-emerald-300/50',
    textPrimary: 'text-emerald-900',
    textSecondary: 'text-emerald-600',
    buttonGradient: 'from-emerald-500 to-teal-500',
    userMsgBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    assistantMsgBg: 'bg-white/80',
  },
  {
    id: 'peach',
    name: 'Cam Đào',
    bgImage: '/images/angel-bg-lavender.png',
    headerBg: 'bg-gradient-to-r from-orange-200/90 to-amber-200/90',
    bodyBg: 'bg-orange-100/80',
    inputBg: 'bg-white/70',
    borderColor: 'border-orange-300/50',
    textPrimary: 'text-orange-900',
    textSecondary: 'text-orange-600',
    buttonGradient: 'from-orange-500 to-amber-500',
    userMsgBg: 'bg-gradient-to-br from-orange-400 to-amber-500',
    assistantMsgBg: 'bg-white/80',
  },
];

interface AngelThemeContextType {
  theme: AngelTheme;
  setThemeById: (id: string) => void;
}

const AngelThemeContext = createContext<AngelThemeContextType | null>(null);

const STORAGE_KEY = 'angel-chat-theme';

export function AngelThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AngelTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = ANGEL_THEMES.find(t => t.id === saved);
        if (found) return found;
      }
    }
    return ANGEL_THEMES[2]; // Default to violet theme
  });

  const setThemeById = (id: string) => {
    const found = ANGEL_THEMES.find(t => t.id === id);
    if (found) {
      setTheme(found);
      localStorage.setItem(STORAGE_KEY, id);
    }
  };

  return (
    <AngelThemeContext.Provider value={{ theme, setThemeById }}>
      {children}
    </AngelThemeContext.Provider>
  );
}

export function useAngelTheme() {
  const context = useContext(AngelThemeContext);
  if (!context) {
    throw new Error('useAngelTheme must be used within AngelThemeProvider');
  }
  return context;
}
