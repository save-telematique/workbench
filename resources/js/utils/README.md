# Utility Functions

This directory contains utility functions for common tasks across the Save Workbench application.

## Date Formatting

The application uses a unified approach to date formatting through the functions in `format.ts`.

### Using the formatDate function

The `formatDate` function provides flexible date formatting with internationalization support:

```typescript
import { formatDate } from '@/utils/format';

// Basic usage with predefined formats
formatDate('2023-01-15T12:30:00Z', 'DATETIME_FULL'); // "Monday, January 15, 2023 at 12:30 PM"
formatDate('2023-01-15T12:30:00Z', 'DATE_MED');      // "Jan 15, 2023"
formatDate('2023-01-15T12:30:00Z', 'TIME');          // "12:30 PM"
formatDate('2023-01-15T12:30:00Z', 'RELATIVE');      // "2 months ago"

// With custom date-fns format string
formatDate('2023-01-15T12:30:00Z', 'yyyy/MM/dd');    // "2023/01/15"

// With explicit locale
formatDate('2023-01-15T12:30:00Z', 'DATE_MED', 'fr'); // "15 janv. 2023"
```

### Using the FormattedDate component

For React components, use the `FormattedDate` component:

```tsx
import FormattedDate from '@/components/formatted-date';

// Basic usage
<FormattedDate date={user.created_at} format="DATE_MED" />

// With custom styling
<FormattedDate 
  date={user.updated_at} 
  format="RELATIVE" 
  className="text-muted-foreground text-sm" 
/>

// With fallback for null dates
<FormattedDate 
  date={user.deleted_at} 
  format="DATE_MED" 
  fallback="Never" 
/>
```

### Predefined Formats

The following predefined formats are available:

| Format Key | Description | Example |
|------------|-------------|---------|
| `DATETIME_FULL` | Full date and time | Monday, January 15, 2023 at 12:30 PM |
| `DATE_FULL` | Full date only | Monday, January 15, 2023 |
| `DATE_MED` | Medium date | Jan 15, 2023 |
| `TIME` | Time only | 12:30 PM |
| `RELATIVE` | Relative time | 2 months ago |
| `ISO` | ISO 8601 format | 2023-01-15T12:30:00.000Z |

### Other Formatting Functions

The utility also provides these additional functions:

- `formatDateForInput(date)`: Formats a date for HTML input elements (`YYYY-MM-DD`)
- `formatCurrency(value, currency)`: Formats a number as currency
- `formatNumber(value, minDecimals, maxDecimals)`: Formats a number with specified decimal places 