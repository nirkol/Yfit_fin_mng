import { useMemo } from 'react';
import { getCurrentDate } from '../utils/testMode';

/**
 * Check if a year can be edited based on business rules:
 * - Current year: always editable
 * - Previous year: only editable in January
 * - Older years: never editable
 */
export function useYearEditable(yearKey: string): boolean {
  return useMemo(() => {
    const now = getCurrentDate();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0 = January)
    const year = parseInt(yearKey);

    // Current year is always editable
    if (year === currentYear) {
      return true;
    }

    // Previous year is only editable in January
    if (year === currentYear - 1 && currentMonth === 0) {
      return true;
    }

    // All other years are read-only
    return false;
  }, [yearKey]);
}
