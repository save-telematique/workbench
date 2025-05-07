import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import DevicesLayout from "@/layouts/devices/layout";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { CsvImportData, DeviceImportRow } from "@/types/csv-import";
import CsvImportUpload from "@/components/csv-import-upload";
import EditableImportTable from "@/components/editable-import-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Building, ArrowRight, Check } from "lucide-react";
import axios from "axios";
import HeadingSmall from '@/components/heading-small';

// Import dialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeviceImportPageProps extends PageProps {
  deviceTypes: Array<{
    id: number;
    name: string;
    manufacturer: string;
  }>;
  tenants: Array<{
    id: string;
    name: string;
  }>;
}

export default function DeviceImport({ deviceTypes, tenants }: DeviceImportPageProps) {
  const { __ } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("tenant");
  const [importData, setImportData] = useState<CsvImportData | null>(null);
  const [parsedDevices, setParsedDevices] = useState<DeviceImportRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [devicesToImport, setDevicesToImport] = useState<DeviceImportRow[]>([]);

  // Handle when import file is analyzed
  const handleImportComplete = (data: CsvImportData) => {
    setImportData(data);
    
    if (data.success && data.data) {
      // Map to DeviceImportRow type for type safety
      const typedDevices = data.data.map(item => ({
        device_type_id: item.device_type_id || null,
        serial_number: String(item.serial_number) || null,
        imei: String(item.imei) || null,
        sim_number: item.sim_number ? String(item.sim_number) : null,
        firmware_version: item.firmware_version ? String(item.firmware_version) : null
      })) as DeviceImportRow[];
      
      setParsedDevices(typedDevices);
      
      // Always switch to review tab when processing is complete
      setActiveTab("review");
    } else {
      // Set empty array if we don't have valid data
      setParsedDevices([]);
      
      // Still navigate to review tab to show the no data message
      setActiveTab("review");
    }
  };

  // Handle when devices data is updated
  const handleDeviceDataChange = (updatedDevices: Record<string, string | number | null>[]) => {
    setParsedDevices(updatedDevices as unknown as DeviceImportRow[]);
  };

  // Handle confirm import (show confirmation dialog)
  const handleConfirmImport = (validData: Record<string, string | number | null>[]) => {
    setDevicesToImport(validData as unknown as DeviceImportRow[]);
    setConfirmDialogOpen(true);
  };

  // Handle actual submission after confirmation
  const handleSubmit = async () => {
    if (isSubmitting || devicesToImport.length === 0) return;
    
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      const response = await axios.post(route('devices.import.store'), {
        devices: devicesToImport,
        tenant_id: selectedTenant,
      });
      
      if (response.data.success) {
        setSuccessMessage(__('devices.import.success_message', { count: response.data.imported_count }));
        
        // Redirect to index page after 1.5 seconds
        setTimeout(() => {
          router.visit(route('devices.index'));
        }, 1500);
      } else {
        console.error('Import failed:', response.data.errors);
      }
    } catch (error) {
      console.error('Error submitting import:', error);
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };

  // Generate field descriptions for the table
  const fieldDescriptions = {
    device_type_id: __('devices.fields.device_type'),
    serial_number: __('devices.fields.serial_number'),
    imei: __('devices.fields.imei'),
    sim_number: __('devices.fields.sim_number'),
    firmware_version: __('devices.fields.firmware_version')
  };

  // Prepare device types for dropdown
  const deviceTypeOptions = deviceTypes.map(type => ({
    id: type.id,
    name: `${type.name} (${type.manufacturer})`
  }));

  // Field options for the table
  const fieldOptions = {
    device_type_id: deviceTypeOptions
  };

  const breadcrumbs = [
    {
      title: __('devices.breadcrumbs.index'),
      href: route('devices.index'),
    },
    {
      title: __('devices.import.title'),
      href: route('devices.import'),
    },
  ];

  // Function to handle tenant selection and move to next step
  const handleTenantSelection = () => {
    setActiveTab("upload");
  };
  
  // Function to check if tenant step is complete
  const isTenantStepComplete = () => {
    return selectedTenant !== null;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={__('devices.import.title')} />
      
      <DevicesLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <HeadingSmall 
              title={__('devices.import.title')} 
              description={__('devices.import.description')}
            />
            <Button variant="outline" asChild>
              <Link href={route('devices.index')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {__("common.back_to_list")}
              </Link>
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tenant">
                <Building className="h-4 w-4 mr-2" />
                {__('common.step')} 1: {__('common.select_tenant')}
                {isTenantStepComplete() && <Check className="h-4 w-4 ml-2 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="upload" disabled={!isTenantStepComplete()}>
                <Upload className="h-4 w-4 mr-2" />
                {__('common.step')} 2: {__('devices.import.upload_tab')}
              </TabsTrigger>
              <TabsTrigger 
                value="review" 
                disabled={!isTenantStepComplete()}
              >
                {__('common.step')} 3: {__('devices.import.review_tab')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tenant" className="space-y-4">
              <Card>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">{__('devices.import.select_tenant_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{__('devices.import.select_tenant_desc')}</p>
                    
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="tenant-selector">
                          {__('devices.fields.tenant')} <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="tenant-selector"
                          className="w-full rounded-md border border-input px-3 py-2 text-sm"
                          value={selectedTenant || ''}
                          onChange={(e) => setSelectedTenant(e.target.value || null)}
                        >
                          <option value="">{__('common.select_placeholder')}</option>
                          {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                          {__('devices.import.tenant_required')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleTenantSelection} 
                      disabled={!isTenantStepComplete()}
                    >
                      {__('common.next')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <CsvImportUpload
                importType="device"
                onImportComplete={handleImportComplete}
                apiEndpoint={route('devices.import.upload')}
              />
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("tenant")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {__('common.previous')}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="review" className="space-y-4">
              {importData ? (
                <>
                  <EditableImportTable
                    data={parsedDevices as unknown as Record<string, string | number | null>[]}
                    mapping={importData.mapping || {}}
                    warnings={importData.warnings || []}
                    fieldDescriptions={fieldDescriptions}
                    fieldOptions={fieldOptions}
                    mandatoryFields={['device_type_id', 'serial_number', 'imei']}
                    onDataChange={handleDeviceDataChange}
                    onSubmit={handleConfirmImport}
                    isSubmitting={isSubmitting}
                    successMessage={successMessage}
                  />
                  
                  <div className="flex justify-start">
                    <Button variant="outline" onClick={() => setActiveTab("upload")} disabled={isSubmitting}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {__('common.previous')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{__('common.csv_import.no_file_processed')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Confirmation Dialog */}
          <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{__('devices.import.confirm_title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {__('devices.import.confirm_description', { count: devicesToImport.length })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>
                  {__('common.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {isSubmitting ? __('common.csv_import.importing') : __('common.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DevicesLayout>
    </AppLayout>
  );
} 