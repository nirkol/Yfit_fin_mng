import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { yearService } from '../services/yearService';
import { getCurrentYear } from '../utils/testMode';

interface YearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
  refreshYears: () => Promise<void>;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: ReactNode }) {
  const currentYear = getCurrentYear();

  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  const refreshYears = async () => {
    try {
      const years = await yearService.getYears();
      const yearKeys = years.map((y) => y.yearKey);

      // Always include current year if not present
      const currentYearKey = getCurrentYear();
      if (!yearKeys.includes(currentYearKey)) {
        yearKeys.push(currentYearKey);
        yearKeys.sort().reverse(); // Sort descending (newest first)
      }

      setAvailableYears(yearKeys);

      if (yearKeys.includes(currentYearKey)) {
        // If current year exists, always select it
        setSelectedYear(currentYearKey);
      } else if (!yearKeys.includes(selectedYear)) {
        // If selected year doesn't exist and current year doesn't exist, use first available
        setSelectedYear(yearKeys[0] || currentYearKey);
      }
    } catch (error) {
      console.error('Failed to fetch years:', error);
      // Fallback to current year if API fails
      const currentYearKey = getCurrentYear();
      setAvailableYears([currentYearKey]);
      setSelectedYear(currentYearKey);
    }
  };

  useEffect(() => {
    // Only fetch years if we have a token (user is authenticated)
    const token = localStorage.getItem('authToken');
    if (token) {
      refreshYears();
    }
  }, []);

  // Also refresh when auth token changes (on login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        refreshYears();
      } else {
        // Clear years on logout
        setAvailableYears([]);
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <YearContext.Provider
      value={{ selectedYear, setSelectedYear, availableYears, refreshYears }}
    >
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
}
