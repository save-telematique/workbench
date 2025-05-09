import React from 'react';
import { formatDate } from '@/utils/format';

interface FormattedDateProps {
  date: string | Date | null;
  format?: string; // date-fns format string or predefined format key
  className?: string;
  fallback?: string;
  locale?: string; // Optional locale override
}

/**
 * FormattedDate component for displaying formatted dates
 * Supports various predefined formats and localization
 * 
 * Usage:
 * <FormattedDate date={user.created_at} format="DATE_MED" />
 * 
 * Available formats:
 * - DATETIME_FULL: full date and time (e.g., "Monday, January 1, 2021 at 12:00 PM")
 * - DATE_FULL: full date only (e.g., "Monday, January 1, 2021")
 * - DATE_MED: medium date (e.g., "Jan 1, 2021")
 * - TIME: time only (e.g., "12:00 PM")
 * - RELATIVE: relative time (e.g., "2 hours ago")
 * - Or any valid date-fns format string
 */
export default function FormattedDate({
  date,
  format = 'DATETIME_FULL',
  className = '',
  fallback = '--',
  locale,
}: FormattedDateProps) {
  // Format the date using the utility function
  const formattedValue = formatDate(date, format, locale);
  
  // Show fallback if no formatted value
  if (!formattedValue) {
    return <span className={className}>{fallback}</span>;
  }
  
  // Generate a more detailed format for the title/tooltip
  const titleValue = formatDate(date, 'DATETIME_FULL', locale);
  
  return (
    <span className={className} title={titleValue}>
      {formattedValue}
    </span>
  );
} 