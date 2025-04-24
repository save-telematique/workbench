import React from 'react';
import { DateTime } from 'luxon';
import { useLocale } from '@/hooks/use-locale';

interface FormattedDateProps {
  date: string | Date | null;
  format?: string;
  className?: string;
  fallback?: string;
  locale?: string;
}

export default function FormattedDate({ 
  date, 
  format = 'DATETIME_FULL', 
  className = '', 
  fallback = '--',
  locale
}: FormattedDateProps) {
  // Get the current locale from the useLocale hook
  const { locale: appLocale } = useLocale();
  const currentLocale = locale || appLocale || document.documentElement.lang || 'fr';
  
  if (!date) {
    return <span className={className}>{fallback}</span>;
  }
  
  const dateTime = typeof date === 'string' 
    ? DateTime.fromISO(date).setLocale(currentLocale)
    : DateTime.fromJSDate(date).setLocale(currentLocale);
    
  if (!dateTime.isValid) {
    return <span className={className}>{fallback}</span>;
  }
  
  // Use format as a predefined format or custom format string
  let formattedDate: string;
  
  switch (format) {
    case 'DATETIME_FULL':
      formattedDate = dateTime.toLocaleString(DateTime.DATETIME_FULL);
      break;
    case 'DATE_FULL':
      formattedDate = dateTime.toLocaleString(DateTime.DATE_FULL);
      break;
    case 'DATE_MED':
      formattedDate = dateTime.toLocaleString(DateTime.DATE_MED);
      break;
    case 'TIME':
      formattedDate = dateTime.toLocaleString(DateTime.TIME_SIMPLE);
      break;
    case 'RELATIVE':
      formattedDate = dateTime.toRelative() || fallback;
      break;
    default:
      // Use format as a custom format string
      formattedDate = dateTime.toFormat(format);
  }
  
  return <span className={className} title={dateTime.toLocaleString(DateTime.DATETIME_FULL)}>{formattedDate}</span>;
} 