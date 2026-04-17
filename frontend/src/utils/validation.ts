// Input validation utilities

/**
 * Validates and filters numeric input (digits only, allows decimal point)
 */
export const validateNumericInput = (value: string): string => {
  // Allow digits and decimal point
  return value.replace(/[^\d.]/g, '');
};

/**
 * Validates and filters integer input (digits only, no decimal)
 */
export const validateIntegerInput = (value: string): string => {
  // Allow digits only
  return value.replace(/[^\d]/g, '');
};

/**
 * Validates and filters text input (Hebrew, English letters and spaces only)
 */
export const validateTextInput = (value: string): string => {
  // Allow Hebrew letters, English letters, and spaces
  return value.replace(/[^א-תa-zA-Z\s]/g, '');
};

/**
 * Validates and filters phone number input (digits, dashes, and spaces)
 */
export const validatePhoneInput = (value: string): string => {
  // Allow digits, dashes, and spaces
  return value.replace(/[^\d\s-]/g, '');
};

/**
 * Validates and filters password input (alphanumeric only, no spaces or special characters)
 */
export const validatePasswordInput = (value: string): string => {
  // Allow English letters and digits only
  return value.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Validates time input (HH:MM format)
 */
export const validateTimeInput = (value: string): string => {
  // Allow digits and colon
  return value.replace(/[^\d:]/g, '');
};
