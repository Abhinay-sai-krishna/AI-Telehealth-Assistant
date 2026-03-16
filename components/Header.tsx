import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
    onHomeClick: () => void;
}

const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-md dark:shadow-slate-900/50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div onClick={onHomeClick} className="flex items-center space-x-3 cursor-pointer">
          <svg className="h-8 w-8 text-sky-500 dark:text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0zM14 9.5v-3a1.5 1.5 0 013 0v3a1.5 1.5 0 01-3 0z" />
          </svg>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
            Integrated Telehealth Assistant
          </h1>
        </div>
        <ThemeToggleButton />
      </div>
    </header>
  );
};

export default Header;
