/**
 * Test mode configuration
 * Set TEST_MODE_JAN_2027 to true to simulate January 2, 2027
 */
export const TEST_MODE_JAN_2027 = false; // Set to true for testing year-end behavior

/**
 * Get the current date, or test date if in test mode
 */
export function getCurrentDate(): Date {
  if (TEST_MODE_JAN_2027) {
    return new Date('2027-01-02T12:00:00');
  }
  return new Date();
}

/**
 * Get current year as string
 */
export function getCurrentYear(): string {
  return getCurrentDate().getFullYear().toString();
}

/**
 * Get current month (0-indexed)
 */
export function getCurrentMonth(): number {
  return getCurrentDate().getMonth();
}
