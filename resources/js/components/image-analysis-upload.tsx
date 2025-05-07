import { useState, useRef } from "react";
import { useTranslation } from "@/utils/translation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, Camera } from "lucide-react";
import { type AnalysisData } from "@/types/analysis";
import axios from "axios";

interface ImageAnalysisUploadProps {
  /**
   * Type of analysis to perform ('vehicle', 'device', or 'driver')
   */
  analysisType: 'vehicle' | 'device' | 'driver';
  
  /**
   * Callback when analysis is complete
   */
  onAnalysisComplete: (data: AnalysisData) => void;
  
  /**
   * Callback when tab should change
   */
  onChangeTab?: (tab: string) => void;
  
  /**
   * API endpoint for the analysis
   */
  apiEndpoint: string;
}

export default function ImageAnalysisUpload({
  analysisType,
  onAnalysisComplete,
  onChangeTab,
  apiEndpoint
}: ImageAnalysisUploadProps) {
  const { __ } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPdfFile, setIsPdfFile] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate the file type and size
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const isPdf = file.type === 'application/pdf';
    const isValidImage = validImageTypes.includes(file.type);
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (!isValidImage && !isPdf) {
      setScanResult({
        success: false,
        message: __(`${analysisType}s.scan.error_invalid_format`)
      });
      return;
    }

    if (file.size > maxFileSize) {
      setScanResult({
        success: false,
        message: __(`${analysisType}s.scan.error_file_too_large`)
      });
      return;
    }

    // Set PDF flag for UI rendering
    setIsPdfFile(isPdf);

    // Create a preview of the image (only for actual images, not PDFs)
    if (isValidImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.onerror = () => {
        setScanResult({
          success: false,
          message: __(`${analysisType}s.scan.error_reading_file`)
        });
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, we don't set an image preview as we'll show an SVG placeholder
      setImagePreview(null);
    }

    // Start scanning process
    setScanning(true);
    setScanResult(null);

    // Create form data to send the image
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(apiEndpoint, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });

      setScanning(false);
      const result = response.data;

      if (result.success && result.data) {
        // Call the callback with the data
        onAnalysisComplete(result.data);

        // Display success message
        setScanResult({
          success: true,
          message: __(`${analysisType}s.scan.success`)
        });
        
        // Automatically switch to manual tab after successful scan
        if (onChangeTab) {
          setTimeout(() => onChangeTab("manual"), 500);
        }
      } else {
        // Display error message
        setScanResult({
          success: false,
          message: result.error || __(`${analysisType}s.scan.error`)
        });
      }
    } catch (error) {
      console.error(`Error scanning ${analysisType} file:`, error);
      
      // Determine the error message to display
      let errorMessage = __(`${analysisType}s.scan.error`);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      setScanResult({
        success: false,
        message: errorMessage
      });
      setScanning(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getAltText = () => {
    if (analysisType === 'vehicle') {
      return __("vehicles.scan.vehicle_registration_document");
    } else if (analysisType === 'device') {
      return __("devices.scan.device_qr_code");
    } else {
      return __("drivers.scan.driver_license_document");
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg">
        {imagePreview ? (
          <div className="relative w-full max-w-md">
            <img 
              src={imagePreview} 
              alt={getAltText()} 
              className="w-full h-auto rounded-md object-contain max-h-[300px]" 
            />
            <Button 
              type="button" 
              onClick={triggerFileInput} 
              variant="secondary" 
              className="mt-2 w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              {__(`${analysisType}s.scan.change_image`)}
            </Button>
          </div>
        ) : isPdfFile ? (
          <div className="relative w-full max-w-md flex flex-col items-center justify-center p-6">
            <FileText className="h-24 w-24 text-neutral-400 mb-3" />
            <p className="text-sm text-neutral-700 text-center font-medium mb-1">
              {__("common.pdf_document")}
            </p>
            <p className="text-xs text-neutral-500 text-center mb-3">
              {__("common.pdf_being_processed")}
            </p>
            <Button 
              type="button" 
              onClick={triggerFileInput} 
              variant="secondary" 
              className="mt-2 w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              {__(`${analysisType}s.scan.change_image`)}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <Upload className="h-10 w-10 text-neutral-400 mb-2" />
              <h3 className="text-lg font-medium">{__(`${analysisType}s.scan.upload_title`)}</h3>
              <p className="text-sm text-neutral-500 max-w-xs">
                {__(`${analysisType}s.scan.upload_description`)}
              </p>
            </div>
            <Button 
              type="button" 
              onClick={triggerFileInput} 
              variant="secondary"
            >
              <Upload className="mr-2 h-4 w-4" />
              {__(`${analysisType}s.scan.select_image`)}
            </Button>
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      {scanning && (
        <div className="mt-4 p-4 bg-neutral-50 border rounded-md text-center">
          <div className="flex justify-center mb-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
          </div>
          <p className="text-neutral-700">{__(`${analysisType}s.scan.scanning`)}</p>
          <p className="text-xs text-neutral-500 mt-1">{__(`${analysisType}s.scan.scanning_hint`)}</p>
        </div>
      )}
      
      {scanResult && (
        <Alert 
          variant={scanResult.success ? 'success' : 'destructive'}
          className="mt-4"
        >
          <AlertDescription>
            {scanResult.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 