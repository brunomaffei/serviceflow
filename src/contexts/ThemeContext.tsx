import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    // First check localStorage
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    // If no saved preference, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme class immediately on mount and when theme changes
  useEffect(() => {
    // Apply dark mode class
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkTheme', JSON.stringify(isDark));
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      if (localStorage.getItem('darkTheme') === null) {
        setIsDark(e.matches);
      }
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      // Update localStorage immediately in the toggle function
      localStorage.setItem('darkTheme', JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
