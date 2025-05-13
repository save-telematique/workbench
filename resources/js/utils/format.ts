/**
 * Formatting utilities for the Save Workbench application
 * Provides standardized formatting for dates, currencies, and numbers
 */
import { format as formatDateFns, parseISO, isValid, formatDistanceToNow, Locale } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

// Locale mapping
const locales: Record<string, Locale> = {
  en: enUS,
  fr: fr,
};

// Get the current locale from document or default to 'fr'
export function getCurrentLocale(): string {
  return document.documentElement.lang || 'fr';
}

// Get the date-fns locale object for the current locale
export function getDateFnsLocale(localeString: string = getCurrentLocale()): Locale {
  return locales[localeString.substring(0, 2)] || enUS;
}

/**
 * Parse a date string or Date object into a valid Date
 * Handles various formats and returns null if invalid
 */
export function parseDate(date: string | Date | null): Date | null {
  if (!date) return null;
  
  let parsedDate: Date;
  
  if (typeof date === 'string') {
    // Try ISO parsing first
    parsedDate = parseISO(date);
    
    // If not valid, try generic Date constructor
    if (!isValid(parsedDate)) {
      parsedDate = new Date(date);
      if (!isValid(parsedDate)) {
        return null;
      }
    }
  } else {
    // It's already a Date object
    parsedDate = date;
    if (!isValid(parsedDate)) {
      return null;
    }
  }
  
  return parsedDate;
}

/**
 * Format a date with a predefined or custom format
 * 
 * @param date The date to format (string or Date object)
 * @param format The format to use (predefined key or date-fns format string)
 * @param locale Optional locale override
 * @returns Formatted date string or empty string if date is invalid
 */
export function formatDate(
  date: string | Date | null,
  format: string = 'DATETIME_FULL',
  locale?: string
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  const dateFnsLocale = locale ? getDateFnsLocale(locale) : getDateFnsLocale();
  
  try {
    switch (format) {
      case 'DATETIME_FULL': 
        return formatDateFns(parsedDate, 'PPPP p', { locale: dateFnsLocale });
      case 'DATE_FULL': 
        return formatDateFns(parsedDate, 'PPPP', { locale: dateFnsLocale });
      case 'DATE_MED': 
        return formatDateFns(parsedDate, 'PP', { locale: dateFnsLocale });
      case 'TIME': 
        return formatDateFns(parsedDate, 'p', { locale: dateFnsLocale });
      case 'RELATIVE': 
        return formatDistanceToNow(parsedDate, { addSuffix: true, locale: dateFnsLocale });
      case 'ISO':
        return parsedDate.toISOString();
      default:
        return formatDateFns(parsedDate, format, { locale: dateFnsLocale });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return formatDateFns(parsedDate, 'PPp', { locale: dateFnsLocale });
  }
}

/**
 * Format a date for input elements (yyyy-MM-dd)
 */
export function formatDateForInput(date: string | Date | null): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  return formatDateFns(parsedDate, 'yyyy-MM-dd');
}

/**
 * Format a currency value
 * 
 * @param value The numeric value to format
 * @param currency The currency code (default: 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat(getCurrentLocale(), {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format a number with specified digits
 * 
 * @param value The numeric value to format
 * @param minimumFractionDigits Minimum fraction digits (default: 0)
 * @param maximumFractionDigits Maximum fraction digits (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat(getCurrentLocale(), {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Simple adapter for code that uses the old formatDate function
 * This can be used during migration to the new format, but new code should use
 * the more robust formatDate function above directly
 * 
 * @deprecated Use formatDate with explicit format parameter instead
 */
export function formatDateLegacy(dateString: string): string {
  return formatDate(dateString, 'DATETIME_FULL');
} 