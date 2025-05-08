import React from 'react';
import { format as formatDateFns, parseISO, isValid, formatDistanceToNow, Locale } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLocale } from '@/hooks/use-locale';

// Locale mapping
const locales: Record<string, Locale> = {
  en: enUS,
  fr: fr,
};

interface FormattedDateProps {
  date: string | Date | null;
  format?: string; // This can be a date-fns format string or one of the predefined keys
  className?: string;
  fallback?: string;
  locale?: string; // Prop to override app's locale
}

export default function FormattedDate({
  date,
  format = 'DATETIME_FULL',
  className = '',
  fallback = '--',
  locale: propLocale, // Renamed to avoid conflict
}: FormattedDateProps) {
  const { locale: appLocale } = useLocale();
  // Determine the locale string to use
  const currentLocaleString = propLocale || appLocale || document.documentElement.lang || 'fr';
  // Get the date-fns locale object, defaulting to enUS if not found
  const dateFnsLocale = locales[currentLocaleString.substring(0, 2)] || enUS;

  if (!date) {
    return <span className={className}>{fallback}</span>;
  }

  let parsedDate: Date;
  if (typeof date === 'string') {
    parsedDate = parseISO(date);
  } else {
    // If it's already a Date object, use it directly
    parsedDate = date;
  }

  if (!isValid(parsedDate)) {
    // Attempt to parse with new Date() as a fallback for non-ISO strings
    if (typeof date === 'string') {
        const genericParsedDate = new Date(date);
        if (isValid(genericParsedDate)) {
            parsedDate = genericParsedDate;
        } else {
            return <span className={className}>{fallback}</span>;
        }
    } else {
        return <span className={className}>{fallback}</span>;
    }
  }

  let formattedDateString: string;

  switch (format) {
    case 'DATETIME_FULL': 
      formattedDateString = formatDateFns(parsedDate, 'PPPP p', { locale: dateFnsLocale });
      break;
    case 'DATE_FULL': 
      formattedDateString = formatDateFns(parsedDate, 'PPPP', { locale: dateFnsLocale });
      break;
    case 'DATE_MED': 
      formattedDateString = formatDateFns(parsedDate, 'PP', { locale: dateFnsLocale });
      break;
    case 'TIME': 
      formattedDateString = formatDateFns(parsedDate, 'p', { locale: dateFnsLocale });
      break;
    case 'RELATIVE': 
      formattedDateString = formatDistanceToNow(parsedDate, { addSuffix: true, locale: dateFnsLocale });
      break;
    default:
      try {
        formattedDateString = formatDateFns(parsedDate, format, { locale: dateFnsLocale });
      } catch (error) {
        console.error("Error formatting date with custom format:", error);
        formattedDateString = formatDateFns(parsedDate, 'PPp', { locale: dateFnsLocale }); 
      }
  }
  
  const titleDateString = formatDateFns(parsedDate, 'PPPPpppp', { locale: dateFnsLocale });

  return <span className={className} title={titleDateString}>{formattedDateString}</span>;
} 