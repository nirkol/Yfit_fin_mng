import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '../themes/themeConfig';
import type { Theme, ThemeType } from '../themes/themeConfig';

interface ThemeContextType {
  theme: Theme;
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('yfit-theme');
    return (saved as ThemeType) || 'modern';
  });

  const theme = themes[currentTheme];

  useEffect(() => {
    localStorage.setItem('yfit-theme', currentTheme);

    // Apply theme CSS variables to root
    const root = document.documentElement;

    // Colors
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-gradient', theme.colors.primaryGradient);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-danger', theme.colors.danger);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-card-bg', theme.colors.cardBackground);
    root.style.setProperty('--color-text-primary', theme.colors.text.primary);
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--color-text-muted', theme.colors.text.muted);
    root.style.setProperty('--color-border', theme.colors.border);

    // Typography
    root.style.setProperty('--font-heading', theme.typography.fontFamily.heading);
    root.style.setProperty('--font-body', theme.typography.fontFamily.body);

    // Effects
    root.style.setProperty('--radius-sm', theme.effects.borderRadius.sm);
    root.style.setProperty('--radius-md', theme.effects.borderRadius.md);
    root.style.setProperty('--radius-lg', theme.effects.borderRadius.lg);
    root.style.setProperty('--radius-xl', theme.effects.borderRadius.xl);
    root.style.setProperty('--radius-full', theme.effects.borderRadius.full);

    root.style.setProperty('--shadow-sm', theme.effects.shadows.sm);
    root.style.setProperty('--shadow-md', theme.effects.shadows.md);
    root.style.setProperty('--shadow-lg', theme.effects.shadows.lg);
    root.style.setProperty('--shadow-xl', theme.effects.shadows.xl);

    root.style.setProperty('--transition-fast', theme.effects.transitions.fast);
    root.style.setProperty('--transition-normal', theme.effects.transitions.normal);
    root.style.setProperty('--transition-slow', theme.effects.transitions.slow);

    // Sidebar
    root.style.setProperty('--sidebar-bg', theme.sidebar.background);
    root.style.setProperty('--sidebar-active-bg', theme.sidebar.activeItemBackground);
    root.style.setProperty('--sidebar-active-border', theme.sidebar.activeItemBorder);
    root.style.setProperty('--sidebar-text', theme.sidebar.textColor);
    root.style.setProperty('--sidebar-active-text', theme.sidebar.activeTextColor);

    // Cards
    root.style.setProperty('--card-border-width', theme.cards.borderWidth);
    root.style.setProperty('--card-border-color', theme.cards.borderColor);
    root.style.setProperty('--card-shadow', theme.cards.shadow);
    root.style.setProperty('--card-hover-shadow', theme.cards.hoverShadow);
    root.style.setProperty('--card-hover-transform', theme.cards.hoverTransform);

    // Buttons
    root.style.setProperty('--btn-primary-bg', theme.buttons.primaryBackground);
    root.style.setProperty('--btn-primary-hover', theme.buttons.primaryHover);
    root.style.setProperty('--btn-secondary-bg', theme.buttons.secondaryBackground);
    root.style.setProperty('--btn-secondary-hover', theme.buttons.secondaryHover);
    root.style.setProperty('--btn-radius', theme.buttons.borderRadius);

    // Charts
    root.style.setProperty('--chart-grid-color', theme.charts.gridColor);
  }, [currentTheme, theme]);

  const setTheme = (newTheme: ThemeType) => {
    setCurrentTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
