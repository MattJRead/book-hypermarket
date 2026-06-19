'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  // The 4-tier theme system centralized in one place
  const themeStyles = {
    'light': 'bg-orange-50 text-stone-900', // Reader's Cream
    'true-light': 'bg-white text-black',
    'dark': 'bg-gray-950 text-white',
    'true-dark': 'bg-black text-gray-300'
  }[theme];

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 selection:bg-sky-500/30 ${themeStyles}`}>
      {children}
    </div>
  );
}