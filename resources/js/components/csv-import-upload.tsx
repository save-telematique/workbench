import { useState, useRef } from "react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet } from "lucide-react";
import { type CsvImportData } from "@/types/csv-import";
import axios from "axios";

interface CsvImportUploadProps {
  /**
   * Type of import to perform ('vehicle', 'device', or 'driver')
   */
  importType: 'vehicle' | 'device' | 'driver';
  
  /**
   * Callback when import is complete
   */
  onImportComplete: (data: CsvImportData) => void;
  
  /**
   * API endpoint for the import
   */
  apiEndpoint: string;
}

export default function CsvImportUpload({
  importType,
  onImportComplete,
  apiEndpoint
}: CsvImportUploadProps) {
  const { __ } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate the file type and size
    const validFileTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
    const isValidFile = validFileTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (!isValidFile) {
      setUploadResult({
        success: false,
        message: __(`${importType}s.import.error_invalid_format`)
      });
      return;
    }

    if (file.size > maxFileSize) {
      setUploadResult({
        success: false,
        message: __(`${importType}s.import.error_file_too_large`)
      });
      return;
    }

    // Start upload process
    setIsUploading(true);
    setUploadResult(null);

    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(apiEndpoint, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });

      setIsUploading(false);
      const result = response.data;

      if (result.success && result.data) {
        // Call the callback with the data
        onImportComplete(result);

        // Display success message
        setUploadResult({
          success: true,
          message: __(`${importType}s.import.analysis_success`, { count: result.data.length })
        });
      } else {
        // Display error message
        setUploadResult({
          success: false,
          message: result.error || __(`${importType}s.import.error`)
        });
      }
    } catch (error) {
      console.error(`Error uploading ${importType} file:`, error);
      
      // Determine the error message to display
      let errorMessage = __(`${importType}s.import.error`);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      setUploadResult({
        success: false,
        message: errorMessage
      });
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileTypeText = () => {
    switch(importType) {
      case 'device':
        return __("devices.import.file_type_description");
      case 'vehicle':
        return __("vehicles.import.file_type_description");
      case 'driver':
        return __("drivers.import.file_type_description");
      default:
        return __("common.csv_import.file_type_description");
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-lg">
        <div className="flex flex-col items-center text-center">
          <FileSpreadsheet className="h-12 w-12 text-neutral-400 mb-3" />
          <h3 className="text-lg font-medium">{__(`${importType}s.import.upload_title`)}</h3>
          <p className="text-sm text-neutral-500 max-w-md mt-2">
            {__(`${importType}s.import.upload_description`)}
          </p>
          <div className="mt-2 text-xs text-neutral-500">
            {getFileTypeText()}
          </div>
        </div>
        
        <Button 
          type="button" 
          onClick={triggerFileInput} 
          variant="secondary"
          disabled={isUploading}
          className="mt-2"
        >
          <Upload className="mr-2 h-4 w-4" />
          {__(`${importType}s.import.select_file`)}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      {isUploading && (
        <div className="mt-4 p-4 bg-neutral-50 border rounded-md text-center">
          <div className="flex justify-center mb-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
          </div>
          <p className="text-neutral-700">{__(`${importType}s.import.analyzing`)}</p>
          <p className="text-xs text-neutral-500 mt-1">{__(`${importType}s.import.analyzing_hint`)}</p>
        </div>
      )}
      
      {uploadResult && (
        <Alert 
          variant={uploadResult.success ? 'success' : 'destructive'}
          className="mt-4"
        >
          <AlertDescription>
            {uploadResult.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 