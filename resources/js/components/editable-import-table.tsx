import { useState, useCallback } from "react";
import { useTranslation } from "@/utils/translation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, AlertTriangle, Trash, FileCheck, AlertCircle, ChevronDown, ChevronRight, ArrowRight, X, CalendarIcon, CircleSlash } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CsvImportWarning } from "@/types/csv-import";
import debounce from 'lodash.debounce';
import axios from 'axios';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';

export type FieldType = 'text' | 'select' | 'date' | 'number' | 'boolean';

export interface EditableImportTableProps<T extends Record<string, string | number | null | boolean>> {
  /**
   * Data rows to display
   */
  data: T[];
  
  /**
   * Field mapping (target field to source field)
   */
  mapping: Record<string, string | null>;
  
  /**
   * Warning messages from the import
   */
  warnings: CsvImportWarning[];
  
  /**
   * Field descriptions used for column headers
   */
  fieldDescriptions: Record<string, string>;
  
  /**
   * Optional dropdown options for fields (field name to options array)
   */
  fieldOptions?: Record<string, Array<{ id: string | number; name: string }>>;

  /**
   * Optional field type definitions (field name to type)
   */
  fieldTypes?: Record<string, FieldType>;
  
  /**
   * Array of mandatory field names
   */
  mandatoryFields?: string[];
  
  /**
   * Callback when data is updated
   */
  onDataChange: (updatedData: T[]) => void;
  
  /**
   * Callback when submit button is clicked
   */
  onSubmit: (validData: T[]) => void;
  
  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;
  
  /**
   * Optional success message
   */
  successMessage?: string | null;

  /**
   * Type of entity being imported ('device', 'vehicle', 'driver')
   */
  entityType?: 'device' | 'vehicle' | 'driver';

  /**
   * API endpoint for row validation
   */
  validateRowEndpoint?: string;

  /**
   * Selected tenant ID for validation context
   */
  tenantId?: string | null;
}

interface RowValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  field_errors: Record<string, string[]>;
}

export default function EditableImportTable<T extends Record<string, string | number | null | boolean>>({
  data,
  mapping,
  warnings,
  fieldDescriptions,
  fieldOptions = {},
  fieldTypes = {},
  mandatoryFields = [],
  onDataChange,
  onSubmit,
  isSubmitting = false,
  successMessage = null,
  entityType = 'device',
  validateRowEndpoint = '',
  tenantId = null
}: EditableImportTableProps<T>) {
  const { __ } = useTranslation();
  const [expandedWarnings, setExpandedWarnings] = useState<number[]>([]);
  const [mappingOpen, setMappingOpen] = useState<boolean>(false);
  const [warningsOpen, setWarningsOpen] = useState<boolean>(true);
  const [rowValidations, setRowValidations] = useState<Record<number, RowValidation>>({});
  const [validationInProgress, setValidationInProgress] = useState<Record<number, boolean>>({});
  
  const fields = Object.keys(mapping);
  
  const toggleWarningExpand = (rowIndex: number) => {
    setExpandedWarnings(prev => 
      prev.includes(rowIndex) 
        ? prev.filter(i => i !== rowIndex) 
        : [...prev, rowIndex]
    );
  };
  
  const toggleAllWarnings = (expand: boolean) => {
    if (expand) {
      const allWarningRows = Array.from(new Set(warnings.map(w => w.row - 2)));
      setExpandedWarnings(allWarningRows);
    } else {
      setExpandedWarnings([]);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedValidateRow = useCallback(
    debounce(
      async (rowIndex: number, rowData: Record<string, string | number | null | boolean>) => {
        if (!validateRowEndpoint || !entityType) {
          return;
        }
        try {
          setValidationInProgress(prev => ({ ...prev, [rowIndex]: true }));
          const response = await axios.post(validateRowEndpoint, {
            row_data: rowData,
            tenant_id: tenantId
          });
          const validationResult = response.data as RowValidation;
          setRowValidations(prev => ({
            ...prev,
            [rowIndex]: validationResult
          }));
        } catch (_error) {
          console.error('Row validation failed:', _error);
          setRowValidations(prev => ({
            ...prev,
            [rowIndex]: {
              valid: false,
              errors: [__('common.csv_import.validation_request_failed')],
              warnings: [],
              field_errors: {}
            }
          }));
        } finally {
          setValidationInProgress(prev => ({ ...prev, [rowIndex]: false }));
        }
      },
      500
    ),
    [validateRowEndpoint, entityType, tenantId, __]
  );
  
  const handleCellChange = (rowIndex: number, field: string, value: string | number | null | boolean | Date) => {
    const newData = [...data];
    let processedValue: string | number | null | boolean = null;

    const currentFieldType = fieldTypes[field] || 'text';

    if (value instanceof Date) {
      processedValue = format(value, 'yyyy-MM-dd');
    } else if (currentFieldType === 'boolean') {
      processedValue = Boolean(value);
    } else if (value === '' && (currentFieldType === 'number' || currentFieldType === 'date')) {
      processedValue = null; // Store empty strings as null for nullable number/date fields
    } else {
      processedValue = value as string | number | null | boolean;
    }
    
    newData[rowIndex] = {
      ...newData[rowIndex],
      [field]: processedValue
    };
    onDataChange(newData);
    
    if (validateRowEndpoint && entityType) {
      debouncedValidateRow(rowIndex, newData[rowIndex]);
    }
  };
  
  const handleDeleteRow = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    const newRowValidations = { ...rowValidations };
    delete newRowValidations[rowIndex];
    setRowValidations(newRowValidations);
    onDataChange(newData);
  };
  
  const warningsByRow = warnings.reduce<Record<number, CsvImportWarning[]>>((acc, warning) => {
    const rowIndex = warning.row - 2;
    if (!acc[rowIndex]) acc[rowIndex] = [];
    acc[rowIndex].push(warning);
    return acc;
  }, {});
  
  const isRowIgnored = (rowIndex: number): boolean => {
    const rowWarnings = warningsByRow[rowIndex] || [];
    return rowWarnings.some(warning => warning.ignored === true);
  };
  
  const allWarningsByRow = {...warningsByRow};
  
  Object.entries(rowValidations).forEach(([rowIndexStr, validation]) => {
    const rowIndex = parseInt(rowIndexStr);
    if (isRowIgnored(rowIndex)) return;

    if (!validation.valid) {
      if (!allWarningsByRow[rowIndex]) allWarningsByRow[rowIndex] = [];
      const existingValidationWarning = allWarningsByRow[rowIndex].find(w => w.message === __('common.csv_import.validation_issues'));
      if (existingValidationWarning) {
        existingValidationWarning.errors = validation.errors; // Update errors
      } else {
        allWarningsByRow[rowIndex].push({
          row: rowIndex + 2,
          message: __('common.csv_import.validation_issues'),
          errors: validation.errors,
          ignored: false
        });
      }
    } else {
      if (allWarningsByRow[rowIndex]) {
        allWarningsByRow[rowIndex] = allWarningsByRow[rowIndex].filter(
          warning => warning.message !== __('common.csv_import.validation_issues')
        );
        if (allWarningsByRow[rowIndex].length === 0) {
          delete allWarningsByRow[rowIndex];
        }
      }
    }
  });
  
  const totalWarningRowsCount = Object.keys(allWarningsByRow).length;
  
  const getWarningsForRow = (rowIndex: number): CsvImportWarning[] => {
    return allWarningsByRow[rowIndex] || [];
  };
  
  const hasFieldError = (rowIndex: number, field: string): boolean => {
    if (rowValidations[rowIndex]?.field_errors) {
      return !!rowValidations[rowIndex].field_errors[field];
    }
    const rowWarnings = getWarningsForRow(rowIndex);
    if (!rowWarnings.length) return false;
    for (const warning of rowWarnings) {
      if (!warning.errors) continue;
      const fieldDescription = fieldDescriptions[field]?.toLowerCase();
      if (warning.errors.some(error => 
        (fieldDescription && error.toLowerCase().includes(fieldDescription)) || 
        error.toLowerCase().includes(field.toLowerCase())
      )) {
        return true;
      }
    }
    return false;
  };

  const getFieldErrorMessages = (rowIndex: number, field: string): string[] => {
    return rowValidations[rowIndex]?.field_errors?.[field] || [];
  };

  const hasRowError = (rowIndex: number): boolean => {
    if (rowValidations[rowIndex]) return !rowValidations[rowIndex].valid;
    const rowWarnings = getWarningsForRow(rowIndex);
    return rowWarnings.some(warning => warning.errors && warning.errors.length > 0);
  };
  
  const renderCell = (row: T, rowIndex: number, field: string) => {
    const currentFieldType = fieldTypes[field] || (field in fieldOptions ? 'select' : 'text');
    const cellValue = row[field];
    const isError = hasFieldError(rowIndex, field);
    const errorClass = isError ? "border-destructive" : "";
    const isDisabled = isSubmitting || isRowIgnored(rowIndex);
    const isValidating = validationInProgress[rowIndex];
    const errorMessages = getFieldErrorMessages(rowIndex, field);

    const errorTooltipContent = errorMessages.length > 0 && (
      <div className="absolute hidden group-hover:block right-0 w-64 p-2 mt-1 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive z-20">
        {errorMessages.map((msg, i) => (
          <div key={i} className="mb-1 last:mb-0">{msg}</div>
        ))}
      </div>
    );
    
    const fieldUIWrapper = (content: React.ReactNode, isSelectOrDate: boolean = false) => (
      <div className="relative">
        {isError && (
          <div className={cn("absolute top-1/2 transform -translate-y-1/2 z-10 group", isSelectOrDate ? "right-8" : "right-2")}>
            <AlertCircle className="h-4 w-4 text-destructive cursor-pointer" />
            {errorTooltipContent}
          </div>
        )}
        {isValidating && !isError && ( // Show spinner only if no error icon
          <div className={cn("absolute top-1/2 transform -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-2 border-solid border-primary border-r-transparent", isSelectOrDate ? "right-8" : "right-2")}></div>
        )}
        {content}
      </div>
    );

    if (currentFieldType === 'select' && field in fieldOptions) {
      return fieldUIWrapper(
        <Select
          value={String(cellValue ?? '')}
          onValueChange={(value) => handleCellChange(rowIndex, field, value)}
          disabled={isDisabled}
        >
          <SelectTrigger className={`w-full ${errorClass} ${isDisabled ? "opacity-70" : ""}`}>
            <SelectValue placeholder={__('common.select_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions[field].map(option => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>, true
      );
    }

    if (currentFieldType === 'date') {
      let dateValue: Date | undefined = undefined;
      if (cellValue && typeof cellValue === 'string') {
          try {
              dateValue = parseISO(cellValue);
          } catch {
              // if parseISO fails, cellValue might be in another format or invalid
              // try direct Date constructor for formats like "MM/DD/YYYY"
              const parsed = new Date(cellValue);
              if (!isNaN(parsed.getTime())) {
                  dateValue = parsed;
              } else {
                // console.warn(`Invalid date string for field ${field}: ${cellValue}`);
              }
          }
      }

      return fieldUIWrapper(
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal bg-transparent",
                !dateValue && "text-muted-foreground",
                errorClass,
                isDisabled && "opacity-70"
              )}
              disabled={isDisabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, "PPP") : <span>{__('common.pick_a_date')}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date: Date | undefined) => handleCellChange(rowIndex, field, date ?? '')}
              initialFocus
            />
          </PopoverContent>
        </Popover>, true
      );
    }

    if (currentFieldType === 'number') {
      return fieldUIWrapper(
        <Input
          type="number"
          value={cellValue === null || cellValue === undefined ? '' : String(cellValue)}
          onChange={(e) => handleCellChange(rowIndex, field, e.target.value === '' ? null : e.target.valueAsNumber)}
          disabled={isDisabled}
          className={`w-full ${errorClass} ${isError ? 'pr-8' : ''} ${isDisabled ? "opacity-70" : ""}`}
        />
      );
    }
    
    if (currentFieldType === 'boolean') {
      // Using a simple text-based select for boolean for now to avoid Checkbox import issues if not set up
      // Ideally, this would be a <Checkbox checked={!!cellValue} onCheckedChange={(checked) => handleCellChange(rowIndex, field, checked)} />
      return fieldUIWrapper(
        <Select
          value={cellValue === null || cellValue === undefined ? '' : (cellValue ? "true" : "false")}
          onValueChange={(value) => handleCellChange(rowIndex, field, value === 'true' ? true : (value === 'false' ? false : null) )}
          disabled={isDisabled}
        >
          <SelectTrigger className={`w-full ${errorClass} ${isDisabled ? "opacity-70" : ""}`}>
            <SelectValue placeholder={__('common.select_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{__('common.select_placeholder_boolean_none')}</SelectItem>
            <SelectItem value="true">{__('common.true')}</SelectItem>
            <SelectItem value="false">{__('common.false')}</SelectItem>
          </SelectContent>
        </Select>, true
      );
    }

    // Default to text input
    return fieldUIWrapper(
      <Input
        type="text"
        value={cellValue === null || cellValue === undefined ? '' : String(cellValue)}
        onChange={(e) => handleCellChange(rowIndex, field, e.target.value)}
        disabled={isDisabled}
        className={`w-full ${errorClass} ${isError ? 'pr-8' : ''} ${isDisabled ? "opacity-70" : ""}`}
      />
    );
  };
  
  const handleSubmit = () => {
    const validData = data.filter((_, rowIndex) => 
      !isRowIgnored(rowIndex) && 
      (!rowValidations[rowIndex] || rowValidations[rowIndex].valid)
    );
    onSubmit(validData);
  };
  
  const mappedFieldsCount = Object.values(mapping).filter(v => v !== null).length;
  const unmappedFieldsCount = Object.values(mapping).filter(v => v === null).length;
  const warningRowsCount = Object.keys(warningsByRow).filter(rowIndex => !isRowIgnored(parseInt(rowIndex))).length; // Count non-ignored warning rows
  const ignoredRowsCount = data.filter((_, rowIndex) => isRowIgnored(rowIndex)).length;


  const validRowsCount = data.filter((_, rowIndex) => 
    !isRowIgnored(rowIndex) && 
    (!rowValidations[rowIndex] || rowValidations[rowIndex].valid) &&
    (!getWarningsForRow(rowIndex).some(w => w.errors && w.errors.length > 0 && !w.ignored)) // Also exclude rows with original critical warnings
  ).length;
  
  const liveValidationErrorsCount = Object.values(rowValidations).filter((v, i) => !v.valid && !isRowIgnored(i)).length;
  const totalIssuesCount = warningRowsCount + liveValidationErrorsCount - ignoredRowsCount; // Adjusted to reflect effective issues
  
  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{__('common.csv_import.data_preview_title')}</CardTitle>
              <CardDescription>
                {data.length > 0
                  ? __('common.csv_import.ready_to_import', { count: validRowsCount })
                  : __('common.csv_import.no_valid_data_summary')}
              </CardDescription>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMappingOpen(!mappingOpen)}
                className="text-xs"
              >
                {mappingOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                {__('common.csv_import.column_mapping')}
              </Button>
              <Button 
                variant="default"
                onClick={handleSubmit} 
                disabled={isSubmitting || validRowsCount === 0}
                size="sm"
                className="text-xs"
              >
                {isSubmitting ? (
                  <FileCheck className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileCheck className="mr-2 h-4 w-4" />
                )}
                {isSubmitting 
                  ? __('common.csv_import.importing') 
                  : __('common.csv_import.import_button', { count: validRowsCount })}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Collapsible open={mappingOpen} onOpenChange={setMappingOpen} className="mb-4">
            <CollapsibleContent>
              <div className="p-3 border rounded-md bg-muted/30 mb-3">
                <h4 className="text-sm font-medium mb-2">{__('common.csv_import.column_mapping')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(mapping).map(([targetField, sourceField]) => (
                    <div key={targetField} className="flex items-center text-sm py-1 border-b last:border-b-0 border-dashed border-border/80">
                      <span className="font-medium min-w-40">
                        {fieldDescriptions[targetField]}
                        {mandatoryFields.includes(targetField) && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </span>
                      <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                      {sourceField ? (
                        <Badge variant="outline">{sourceField}</Badge>
                      ) : (
                        <Badge variant="destructive" className="border-destructive/30">
                          {__('common.csv_import.not_mapped')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <div className="p-3 border rounded-md bg-gray-50 dark:bg-neutral-800 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{__('common.csv_import.data')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">{data.length}</span>
                  <span className="text-sm text-muted-foreground">{__('common.csv_import.rows')}</span>
                  <Badge variant={validRowsCount === data.length && data.length > 0 ? "default" : "outline"} className="ml-2">
                    {validRowsCount} {__('common.csv_import.valid')}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{__('common.csv_import.fields')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-primary">{mappedFieldsCount}</span>
                  <span className="text-sm text-muted-foreground">{__('common.csv_import.mapped')}</span>
                  {unmappedFieldsCount > 0 && (
                    <Badge variant="outline">
                      {unmappedFieldsCount} {__('common.csv_import.unmapped')}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{__('common.csv_import.issues')}</span>
                <div className="flex items-center gap-2">
                  {totalIssuesCount > 0 ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-2xl font-semibold text-amber-500">{totalIssuesCount}</span>
                      <span className="text-sm text-muted-foreground">{__('common.csv_import.row_with_issues', { count: totalIssuesCount })}</span>
                      {ignoredRowsCount > 0 && (
                        <Badge variant="destructive">
                          {ignoredRowsCount} {__('common.csv_import.row_ignored_count', { count: ignoredRowsCount })}
                        </Badge>
                      )}
                    </>
                  ) : ( data.length > 0 ? (
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {__('common.csv_import.no_issues_found')}
                    </span> ) : (
                    <span className="text-sm text-muted-foreground flex items-center">
                        <CircleSlash className="h-4 w-4 text-muted-foreground mr-2" />
                        {__('common.csv_import.no_data_to_validate')}
                    </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          {successMessage && (
            <Alert variant="default" className="mb-4">
              <Check className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Warnings Section */}
      {(totalWarningRowsCount > 0 || ignoredRowsCount > 0) && (
        <Card className="border-amber-200 dark:border-amber-700 mb-4">
          <CardHeader className="pb-3">
            <div 
              className="flex justify-between items-center cursor-pointer" 
              onClick={() => setWarningsOpen(!warningsOpen)}
            >
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                {__('common.csv_import.warnings_details')} ({totalWarningRowsCount + ignoredRowsCount})
              </CardTitle>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); toggleAllWarnings(true); }} className="text-xs">{__('common.expand_all')}</Button>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); toggleAllWarnings(false);}} className="text-xs">{__('common.collapse_all')}</Button>
                <div className="inline-flex h-8 w-8 items-center justify-center">{warningsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</div>
              </div>
            </div>
          </CardHeader>
          <Collapsible open={warningsOpen} onOpenChange={setWarningsOpen}>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4 max-h-[400px] overflow-y-auto p-1">
                  {Object.entries(allWarningsByRow).map(([rowIndexStr, rowWarnings]) => {
                    const rowIndex = parseInt(rowIndexStr);
                    const isIgnoredOriginal = warningsByRow[rowIndex]?.some(w => w.ignored); // Check original ignored status
                    const isLiveIssue = rowValidations[rowIndex] && !rowValidations[rowIndex].valid;
                    const effectiveIsIgnored = isIgnoredOriginal || (rowValidations[rowIndex]?.errors.includes("ROW_IS_IGNORED_DUE_TO_CRITICAL_ERROR")); // Or similar logic
                    
                    const isExpanded = expandedWarnings.includes(rowIndex);
                    
                    if (rowWarnings.length === 0 && !isLiveIssue) return null; // Skip if no warnings or live issues for this row after filtering

                    return (
                      <div key={`warnings-${rowIndex}`} className={cn(`p-3 rounded-md border`, 
                        effectiveIsIgnored ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700' : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700')}
                      >
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleWarningExpand(rowIndex)}>
                          <div className="flex items-center gap-2">
                            {effectiveIsIgnored ? <X className="h-4 w-4 text-destructive" /> : <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />}
                            <p className="font-medium">{__('common.csv_import.row_with_number', { row: rowIndex + 2 })}</p>
                            {effectiveIsIgnored && <Badge variant="destructive">{__('common.csv_import.row_ignored')}</Badge>}
                          </div>
                          <div className="flex items-center justify-center h-8 w-8">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</div>
                        </div>
                        {isExpanded && (
                          <div className="mt-2">
                            {rowWarnings.map((warning, wIndex) => (
                              <div key={wIndex} className="mb-2 last:mb-0">
                                <p className="text-sm font-medium mb-1 text-amber-800 dark:text-amber-300">{warning.message}</p>
                                {warning.errors && warning.errors.length > 0 && (
                                  <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-amber-700 dark:text-amber-400 pl-2">
                                    {warning.errors.map((error, i) => <li key={i}>{error.replace(/^(Ligne|Row) \d+: /i, '')}</li>)}
                                  </ul>
                                )}
                              </div>
                            ))}
                             {rowValidations[rowIndex] && Object.keys(rowValidations[rowIndex].field_errors).length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium mb-1 text-amber-800 dark:text-amber-300">{__('common.csv_import.field_specific_errors')}</p>
                                    <div className="mt-1 space-y-1 text-sm text-amber-700 dark:text-amber-400 pl-2">
                                      {Object.entries(rowValidations[rowIndex].field_errors).map(([field, errors]) => (
                                        <div key={field} className="mb-1">
                                          <strong>{fieldDescriptions[field] || field}:</strong>
                                          <ul className="list-disc list-inside ml-2">
                                            {(errors as string[]).map((error, i) => <li key={i}>{error}</li>)}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
      
      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map(field => (
                <TableHead key={field}>
                  {fieldDescriptions[field]}
                  {mandatoryFields.includes(field) && <span className="text-destructive ml-1">*</span>}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fields.length + 1} className="h-24 text-center">
                  {warnings.length > 0 
                    ? __('common.csv_import.all_rows_invalid_or_ignored')
                    : __('common.csv_import.no_valid_data_for_table')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const isIgnored = isRowIgnored(rowIndex);
                const hasErr = hasRowError(rowIndex);
                
                let rowClassName = "hover:bg-muted/50 dark:hover:bg-muted/80";
                if (isIgnored) {
                  rowClassName = "bg-red-50/50 dark:bg-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/40 opacity-70";
                } else if (hasErr) {
                  rowClassName = "bg-amber-50/50 dark:bg-amber-900/30 hover:bg-amber-50 dark:hover:bg-amber-900/40";
                }
                
                return (
                  <TableRow key={rowIndex} className={rowClassName}>
                    {fields.map(field => (
                      <TableCell key={`${rowIndex}-${field}`} className="py-2 px-3 align-top"> {/* Reduced padding */}
                        {renderCell(row, rowIndex, field)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right py-2 px-3 align-top"> {/* Reduced padding */}
                      <div className="flex items-center justify-end space-x-1">
                        {(hasErr || getWarningsForRow(rowIndex).length > 0) && !isIgnored && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              toggleWarningExpand(rowIndex);
                              if (!warningsOpen) setWarningsOpen(true); // Open warnings section if closed
                               // Scroll to warnings section - this might need a ref to the warnings card
                              const warningsCard = document.querySelector('.border-amber-200'); // Improve selector if possible
                              warningsCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            title={__('common.toggle_warning_details')}
                            className="text-amber-500 hover:text-amber-600 h-8 w-8"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        )}
                        {!isIgnored && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRow(rowIndex)}
                            disabled={isSubmitting}
                            title={__('common.delete')}
                            className="text-destructive hover:text-destructive/90 h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                        {isIgnored && (
                          <Badge variant="destructive" className="text-xs h-8 flex items-center">
                            {__('common.csv_import.ignored')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}