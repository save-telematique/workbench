import { useState } from "react";
import { useTranslation } from "@/utils/translation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, AlertTriangle, Trash, FileCheck, AlertCircle, ChevronDown, ChevronRight, ArrowRight, X } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CsvImportWarning } from "@/types/csv-import";

interface EditableImportTableProps<T extends Record<string, string | number | null>> {
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
}

export default function EditableImportTable<T extends Record<string, string | number | null>>({
  data,
  mapping,
  warnings,
  fieldDescriptions,
  fieldOptions = {},
  mandatoryFields = [],
  onDataChange,
  onSubmit,
  isSubmitting = false,
  successMessage = null
}: EditableImportTableProps<T>) {
  const { __ } = useTranslation();
  const [expandedWarnings, setExpandedWarnings] = useState<number[]>([]);
  const [mappingOpen, setMappingOpen] = useState<boolean>(false);
  const [warningsOpen, setWarningsOpen] = useState<boolean>(true);
  
  // Get field names from the mapping (these are the target fields)
  const fields = Object.keys(mapping);
  
  // Toggle expanded warnings
  const toggleWarningExpand = (rowIndex: number) => {
    setExpandedWarnings(prev => 
      prev.includes(rowIndex) 
        ? prev.filter(i => i !== rowIndex) 
        : [...prev, rowIndex]
    );
  };
  
  // Expand or collapse all warnings
  const toggleAllWarnings = (expand: boolean) => {
    if (expand) {
      // Get all row indices that have warnings
      const allWarningRows = Array.from(new Set(warnings.map(w => w.row - 2)));
      setExpandedWarnings(allWarningRows);
    } else {
      setExpandedWarnings([]);
    }
  };
  
  // Handle cell value change
  const handleCellChange = (rowIndex: number, field: string, value: string | number) => {
    const newData = [...data];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [field]: value
    };
    onDataChange(newData);
  };
  
  // Handle row deletion
  const handleDeleteRow = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    onDataChange(newData);
  };
  
  // Group warnings by row
  const warningsByRow = warnings.reduce<Record<number, CsvImportWarning[]>>((acc, warning) => {
    const rowIndex = warning.row - 2; // Convert 1-indexed row to 0-indexed
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(warning);
    return acc;
  }, {});
  
  // Find warning for a specific row
  const getWarningsForRow = (rowIndex: number): CsvImportWarning[] => {
    return warningsByRow[rowIndex] || [];
  };
  
  // Determine if a row is ignored
  const isRowIgnored = (rowIndex: number): boolean => {
    const rowWarnings = getWarningsForRow(rowIndex);
    return rowWarnings.some(warning => warning.ignored === true);
  };
  
  // Check if a specific field in a specific row has an error
  const hasFieldError = (rowIndex: number, field: string): boolean => {
    const rowWarnings = getWarningsForRow(rowIndex);
    if (!rowWarnings.length) return false;
    
    for (const warning of rowWarnings) {
      if (!warning.errors) continue;
      
      // Look for field name in error messages
      const fieldDescription = fieldDescriptions[field].toLowerCase();
      if (warning.errors.some(error => 
        error.toLowerCase().includes(fieldDescription) || 
        error.toLowerCase().includes(field.toLowerCase())
      )) {
        return true;
      }
    }
    
    return false;
  };
  
  // Render a cell with appropriate editor based on field type and options
  const renderCell = (row: T, rowIndex: number, field: string) => {
    const hasError = hasFieldError(rowIndex, field);
    const errorClass = hasError ? "border-destructive" : "";
    const isDisabled = isSubmitting || isRowIgnored(rowIndex);
    
    // Check if this field has dropdown options
    if (field in fieldOptions) {
      return (
        <div className="relative">
          {hasError && (
            <AlertCircle className="h-4 w-4 text-destructive absolute right-8 top-1/2 transform -translate-y-1/2" />
          )}
          <Select
            value={String(row[field] || '')}
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
          </Select>
        </div>
      );
    }
    
    // Default to text input for other fields
    return (
      <div className="relative">
        {hasError && (
          <AlertCircle className="h-4 w-4 text-destructive absolute right-2 top-1/2 transform -translate-y-1/2 z-10" />
        )}
        <Input
          type="text"
          value={row[field] || ''}
          onChange={(e) => handleCellChange(rowIndex, field, e.target.value)}
          disabled={isDisabled}
          className={`w-full ${errorClass} ${hasError ? 'pr-8' : ''} ${isDisabled ? "opacity-70" : ""}`}
        />
      </div>
    );
  };
  
  // Handle form submission for import, filtering out ignored rows
  const handleSubmit = () => {
    // Filter out ignored rows before submitting
    const validData = data.filter((_, rowIndex) => !isRowIgnored(rowIndex));
    onSubmit(validData);
  };
  
  // Calculate various stats for the summary
  const mappedFieldsCount = Object.values(mapping).filter(v => v !== null).length;
  const unmappedFieldsCount = Object.values(mapping).filter(v => v === null).length;
  const warningRowsCount = Object.keys(warningsByRow).length;
  const ignoredRowsCount = warnings.filter(w => w.ignored).length;
  // Count valid rows by filtering out ignored rows
  const validRowsCount = data.filter((_, rowIndex) => !isRowIgnored(rowIndex)).length;
  
  return (
    <div className="space-y-4">
      {/* ===== SUMMARY CARD ===== */}
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
                  : __('common.csv_import.import_button')}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Column Mapping Display */}
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
                        <Badge variant="outline" className="text-destructive border-destructive/30">
                          {__('common.csv_import.not_mapped')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Information Summary */}
          <div className="p-3 border rounded-md bg-gray-50 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {__('common.csv_import.data')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">{data.length}</span>
                  <span className="text-sm text-muted-foreground">{__('common.csv_import.valid_rows')}</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {__('common.csv_import.fields')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-primary">{mappedFieldsCount}</span>
                  <span className="text-sm text-muted-foreground">{__('common.csv_import.mapped')}</span>
                  {unmappedFieldsCount > 0 && (
                    <Badge variant="outline" className="text-amber-500 border-amber-200">
                      {unmappedFieldsCount} {__('common.csv_import.unmapped')}
                    </Badge>
                  )}
                </div>
              </div>
              
              {warnings.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {__('common.csv_import.warnings')}
                  </span>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-2xl font-semibold text-amber-500">{warningRowsCount}</span>
                    <span className="text-sm text-muted-foreground">
                      {__('common.csv_import.rows_with_issues')}
                    </span>
                    {ignoredRowsCount > 0 && (
                      <Badge variant="outline" className="text-destructive border-destructive/30">
                        {ignoredRowsCount} {__('common.csv_import.rows_ignored')}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {successMessage && (
            <Alert variant="success" className="mb-4 border-green-300 bg-green-50">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription>
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* ===== WARNINGS SECTION ===== */}
      {warnings.length > 0 && (
        <Card className="border-amber-200 mb-4">
          <CardHeader className="pb-3">
            <div 
              className="flex justify-between items-center cursor-pointer" 
              onClick={() => setWarningsOpen(!warningsOpen)}
            >
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                {__('common.csv_import.warnings_details')} ({warnings.length})
              </CardTitle>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllWarnings(true);
                  }}
                  className="text-xs"
                >
                  {__('common.expand_all')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllWarnings(false);
                  }}
                  className="text-xs"
                >
                  {__('common.collapse_all')}
                </Button>
                <div className="inline-flex h-8 w-8 items-center justify-center">
                  {warningsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </div>
            </div>
          </CardHeader>
          <Collapsible open={warningsOpen} onOpenChange={setWarningsOpen}>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {Object.entries(warningsByRow).map(([rowIndexStr, rowWarnings]) => {
                    const rowIndex = parseInt(rowIndexStr);
                    const isIgnored = rowWarnings.some(w => w.ignored);
                    const isExpanded = expandedWarnings.includes(rowIndex);
                    
                    return (
                      <div key={rowIndex} className={`p-3 rounded-md border ${isIgnored ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div 
                          className="flex items-center justify-between cursor-pointer" 
                          onClick={() => toggleWarningExpand(rowIndex)}
                        >
                          <div className="flex items-center gap-2">
                            {isIgnored ? (
                              <X className="h-4 w-4 text-destructive" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                            <p className="font-medium">
                              {__('common.csv_import.row_with_number', { row: rowIndex + 2 })}
                            </p>
                            {isIgnored && (
                              <Badge variant="destructive">
                                {__('common.csv_import.row_ignored')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-center h-8 w-8">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-2">
                            {rowWarnings.map((warning, wIndex) => (
                              <div key={wIndex} className="mb-2 last:mb-0">
                                <p className="text-sm font-medium mb-1 text-amber-800">
                                  {warning.message}
                                </p>
                                {warning.errors && warning.errors.length > 0 && (
                                  <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-amber-700 pl-2">
                                    {warning.errors.map((error, i) => (
                                      <li key={i}>{error.replace(/^(Ligne|Row) \d+: /i, '')}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
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
      
      {/* ===== DATA TABLE ===== */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map(field => (
                <TableHead key={field}>
                  {fieldDescriptions[field]}
                  {mandatoryFields.includes(field) && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fields.length + 1} className="h-24 text-center">
                  {warnings.length > 0 
                    ? __('common.csv_import.all_rows_invalid')
                    : __('common.csv_import.no_valid_data')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const rowWarnings = getWarningsForRow(rowIndex);
                const isIgnored = isRowIgnored(rowIndex);
                
                // Style based on warning severity
                let rowClassName = "hover:bg-muted/50";
                if (isIgnored) {
                  rowClassName = "bg-red-50/50 hover:bg-red-50 opacity-70";
                } else if (rowWarnings.length > 0) {
                  rowClassName = "bg-amber-50/50 hover:bg-amber-50";
                }
                
                return (
                  <TableRow key={rowIndex} className={rowClassName}>
                    {fields.map(field => (
                      <TableCell key={`${rowIndex}-${field}`}>
                        {renderCell(row, rowIndex, field)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {!isIgnored && rowWarnings.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleWarningExpand(rowIndex)}
                            title={__('common.toggle_warning_details')}
                            className="text-amber-500 hover:text-amber-600"
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
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                        {isIgnored && (
                          <Badge variant="destructive" className="text-xs">
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