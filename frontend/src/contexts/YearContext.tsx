import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { yearService } from '../services/yearService';

interface YearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
  refreshYears: () => Promise<void>;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  const refreshYears = async () => {
    try {
      const years = await yearService.getYears();
      const yearKeys = years.map((y) => y.yearKey);
      setAvailableYears(yearKeys);

      // If selected year doesn't exist, set to current year or first available
      if (!yearKeys.includes(selectedYear)) {
        const currentYear = new Date().getFullYear().toString();
        setSelectedYear(yearKeys.includes(currentYear) ? currentYear : yearKeys[0] || currentYear);
      }
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  useEffect(() => {
    // Only fetch years if we have a token (user is authenticated)
    if (localStorage.getItem('authToken')) {
      refreshYears();
    }
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
