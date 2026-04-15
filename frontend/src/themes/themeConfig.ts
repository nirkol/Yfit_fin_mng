// Theme Configuration for YFit Fin Management
// Three distinct look & feel alternatives

export interface Theme {
  name: string;
  colors: {
    primary: string;
    primaryGradient: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    background: string;
    cardBackground: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
    };
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    weights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  effects: {
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
  };
  sidebar: {
    background: string;
    activeItemBackground: string;
    activeItemBorder: string;
    textColor: string;
    activeTextColor: string;
  };
  cards: {
    borderWidth: string;
    borderColor: string;
    shadow: string;
    hoverShadow: string;
    hoverTransform: string;
  };
  buttons: {
    primaryBackground: string;
    primaryHover: string;
    secondaryBackground: string;
    secondaryHover: string;
    borderRadius: string;
  };
  charts: {
    colors: string[];
    gridColor: string;
    useGradients: boolean;
  };
}

// Alternative 1: Modern Gradient Pro
export const modernGradientTheme: Theme = {
  name: 'Modern Gradient Pro',
  colors: {
    primary: '#6366F1',
    primaryGradient: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
    secondary: '#14B8A6',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    background: '#F9FAFB',
    cardBackground: '#FFFFFF',
    text: {
      primary: '#1F2937',
      secondary: '#374151',
      muted: '#6B7280',
    },
    border: '#E5E7EB',
  },
  typography: {
    fontFamily: {
      heading: "'Heebo', sans-serif",
      body: "'Assistant', sans-serif",
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  effects: {
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    transitions: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  sidebar: {
    background: 'linear-gradient(180deg, #6366F1 0%, #3B82F6 100%)',
    activeItemBackground: 'rgba(255, 255, 255, 0.15)',
    activeItemBorder: '3px solid rgba(255, 255, 255, 0.4)',
    textColor: 'rgba(255, 255, 255, 0.9)',
    activeTextColor: '#FFFFFF',
  },
  cards: {
    borderWidth: '3px',
    borderColor: 'transparent',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    hoverShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    hoverTransform: 'translateY(-2px)',
  },
  buttons: {
    primaryBackground: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
    primaryHover: 'linear-gradient(135deg, #5558E3 0%, #2563EB 100%)',
    secondaryBackground: '#F3F4F6',
    secondaryHover: '#E5E7EB',
    borderRadius: '0.5rem',
  },
  charts: {
    colors: ['#6366F1', '#3B82F6', '#14B8A6', '#10B981', '#F59E0B', '#EF4444'],
    gridColor: '#E5E7EB',
    useGradients: true,
  },
};

// Alternative 2: Minimal Professional Clean
export const minimalCleanTheme: Theme = {
  name: 'Minimal Professional Clean',
  colors: {
    primary: '#1E3A8A',
    primaryGradient: '#1E3A8A',
    secondary: '#475569',
    accent: '#3B82F6',
    success: '#059669',
    warning: '#EA580C',
    danger: '#DC2626',
    background: '#FAFAFA',
    cardBackground: '#FFFFFF',
    text: {
      primary: '#0F172A',
      secondary: '#1E293B',
      muted: '#64748B',
    },
    border: '#E2E8F0',
  },
  typography: {
    fontFamily: {
      heading: "'Inter', sans-serif",
      body: "'Inter', sans-serif",
    },
    sizes: {
      xs: '0.6875rem',
      sm: '0.8125rem',
      base: '0.9375rem',
      lg: '1.0625rem',
      xl: '1.125rem',
      '2xl': '1.375rem',
      '3xl': '1.75rem',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  effects: {
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      md: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      lg: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      xl: '0 4px 6px 0 rgba(0, 0, 0, 0.07)',
    },
    transitions: {
      fast: '100ms cubic-bezier(0.4, 0, 1, 1)',
      normal: '200ms cubic-bezier(0.4, 0, 1, 1)',
      slow: '300ms cubic-bezier(0.4, 0, 1, 1)',
    },
  },
  sidebar: {
    background: '#FFFFFF',
    activeItemBackground: '#F1F5F9',
    activeItemBorder: '4px solid #1E3A8A',
    textColor: '#475569',
    activeTextColor: '#0F172A',
  },
  cards: {
    borderWidth: '1px',
    borderColor: '#E2E8F0',
    shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    hoverShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    hoverTransform: 'none',
  },
  buttons: {
    primaryBackground: '#1E3A8A',
    primaryHover: '#1E40AF',
    secondaryBackground: '#F1F5F9',
    secondaryHover: '#E2E8F0',
    borderRadius: '0.375rem',
  },
  charts: {
    colors: ['#1E3A8A', '#3B82F6', '#475569', '#059669', '#EA580C', '#DC2626'],
    gridColor: '#CBD5E1',
    useGradients: false,
  },
};

// Alternative 3: Vibrant Energetic Fitness
export const vibrantFitnessTheme: Theme = {
  name: 'Vibrant Energetic Fitness',
  colors: {
    primary: '#FF6B35',
    primaryGradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
    secondary: '#F7931E',
    accent: '#00D9FF',
    success: '#84CC16',
    warning: '#FDE047',
    danger: '#EC4899',
    background: '#FFF8F0',
    cardBackground: '#FFFBF5',
    text: {
      primary: '#292524',
      secondary: '#44403C',
      muted: '#78716C',
    },
    border: '#E7E5E4',
  },
  typography: {
    fontFamily: {
      heading: "'Rubik', sans-serif",
      body: "'Nunito', sans-serif",
    },
    sizes: {
      xs: '0.8125rem',
      sm: '0.9375rem',
      base: '1.0625rem',
      lg: '1.1875rem',
      xl: '1.375rem',
      '2xl': '1.75rem',
      '3xl': '2.25rem',
    },
    weights: {
      normal: 400,
      medium: 600,
      semibold: 700,
      bold: 800,
    },
  },
  effects: {
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1.25rem',
      xl: '1.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 2px 4px 0 rgba(255, 107, 53, 0.15)',
      md: '0 4px 8px 0 rgba(255, 107, 53, 0.2)',
      lg: '0 8px 16px 0 rgba(255, 107, 53, 0.25)',
      xl: '0 12px 24px 0 rgba(255, 107, 53, 0.3)',
    },
    transitions: {
      fast: '150ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      normal: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      slow: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  sidebar: {
    background: 'linear-gradient(180deg, #FF6B35 0%, #F7931E 100%)',
    activeItemBackground: 'rgba(255, 255, 255, 0.25)',
    activeItemBorder: '0px',
    textColor: 'rgba(255, 255, 255, 0.95)',
    activeTextColor: '#FFFFFF',
  },
  cards: {
    borderWidth: '0px',
    borderColor: 'transparent',
    shadow: '0 4px 8px 0 rgba(255, 107, 53, 0.2)',
    hoverShadow: '0 8px 16px 0 rgba(255, 107, 53, 0.25)',
    hoverTransform: 'scale(1.02) translateY(-2px)',
  },
  buttons: {
    primaryBackground: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
    primaryHover: 'linear-gradient(135deg, #E65A2E 0%, #E08419 100%)',
    secondaryBackground: '#FEF3C7',
    secondaryHover: '#FDE68A',
    borderRadius: '9999px',
  },
  charts: {
    colors: ['#FF6B35', '#F7931E', '#00D9FF', '#84CC16', '#FDE047', '#EC4899'],
    gridColor: '#E7E5E4',
    useGradients: true,
  },
};

export const themes = {
  modern: modernGradientTheme,
  minimal: minimalCleanTheme,
  vibrant: vibrantFitnessTheme,
};

export type ThemeType = keyof typeof themes;
