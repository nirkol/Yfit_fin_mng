import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeType } from '../themes/themeConfig';

export default function ThemeSwitcher() {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const themes: { id: ThemeType; name: string; preview: string; colors: string[] }[] = [
    {
      id: 'modern',
      name: 'Modern Gradient Pro',
      preview: 'Sophisticated • Tech-Forward • SaaS-Style',
      colors: ['#6366F1', '#3B82F6', '#14B8A6', '#10B981'],
    },
    {
      id: 'minimal',
      name: 'Minimal Professional Clean',
      preview: 'Business-Like • Data-Focused • Efficient',
      colors: ['#1E3A8A', '#3B82F6', '#475569', '#059669'],
    },
    {
      id: 'vibrant',
      name: 'Vibrant Energetic Fitness',
      preview: 'Fun • Energetic • Motivating',
      colors: ['#FF6B35', '#F7931E', '#00D9FF', '#84CC16'],
    },
  ];

  return (
    <div className="relative">
      {/* Theme Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
        style={{
          background: 'var(--btn-primary-bg)',
          color: 'white',
        }}
      >
        <Palette className="w-5 h-5" />
        <span className="font-medium">ערכות נושא</span>
      </button>

      {/* Theme Selection Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed bottom-24 left-6 z-50 w-96 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: 'var(--color-card-bg)',
              border: `1px solid var(--color-border)`,
            }}
          >
            {/* Header */}
            <div
              className="p-6 border-b"
              style={{
                background: 'var(--color-primary-gradient)',
                color: 'white',
                borderColor: 'transparent',
              }}
            >
              <h3 className="text-xl font-bold mb-1">בחר ערכת נושא</h3>
              <p className="text-sm opacity-90">שנה את המראה והתחושה של האפליקציה</p>
            </div>

            {/* Theme Options */}
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-right p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: currentTheme === themeOption.id
                      ? 'var(--color-primary)'
                      : 'var(--color-background)',
                    color: currentTheme === themeOption.id
                      ? 'white'
                      : 'var(--color-text-primary)',
                    border: currentTheme === themeOption.id
                      ? '2px solid transparent'
                      : `2px solid var(--color-border)`,
                    transform: currentTheme === themeOption.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Theme Name */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg">{themeOption.name}</h4>
                    {currentTheme === themeOption.id && (
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Theme Description */}
                  <p
                    className="text-sm mb-3"
                    style={{
                      opacity: currentTheme === themeOption.id ? 0.9 : 0.7,
                    }}
                  >
                    {themeOption.preview}
                  </p>

                  {/* Color Swatches */}
                  <div className="flex gap-2">
                    {themeOption.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-lg shadow-md"
                        style={{
                          backgroundColor: color,
                          border: currentTheme === themeOption.id ? '2px solid white' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer Note */}
            <div
              className="p-4 border-t text-center text-sm"
              style={{
                background: 'var(--color-background)',
                color: 'var(--color-text-muted)',
                borderColor: 'var(--color-border)',
              }}
            >
              השינויים נשמרים אוטומטית
            </div>
          </div>
        </>
      )}
    </div>
  );
}
