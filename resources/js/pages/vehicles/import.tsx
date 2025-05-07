import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import VehiclesLayout from "@/layouts/vehicles/layout";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { CsvImportData, VehicleImportRow } from "@/types/csv-import";
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

interface VehicleImportPageProps extends PageProps {
  vehicleTypes: Array<{
    id: number;
    name: string;
  }>;
  vehicleBrands: Array<{
    id: number;
    name: string;
    models: Array<{
      id: number;
      name: string;
    }>;
  }>;
  tenants: Array<{
    id: string;
    name: string;
  }>;
}

export default function VehicleImport({ vehicleTypes, vehicleBrands, tenants }: VehicleImportPageProps) {
  const { __ } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("tenant");
  const [importData, setImportData] = useState<CsvImportData | null>(null);
  const [parsedVehicles, setParsedVehicles] = useState<VehicleImportRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [vehiclesToImport, setVehiclesToImport] = useState<VehicleImportRow[]>([]);

  // Build vehicle models dropdown
  const vehicleModelOptions = vehicleBrands.flatMap(brand => 
    brand.models.map(model => ({
      id: model.id,
      name: `${brand.name} ${model.name}`
    }))
  );

  // Handle when import file is analyzed
  const handleImportComplete = (data: CsvImportData) => {
    setImportData(data);
    
    if (data.success && data.data) {
      // Map to VehicleImportRow type for type safety
      const typedVehicles = data.data.map(item => ({
        registration: String(item.registration) || null,
        vin: String(item.vin) || null,
        vehicle_model_id: item.vehicle_model_id || null,
        vehicle_type_id: item.vehicle_type_id || null,
        year: item.year || null,
        color: item.color ? String(item.color) : null,
        notes: item.notes ? String(item.notes) : null
      })) as VehicleImportRow[];
      
      setParsedVehicles(typedVehicles);
      
      // Always switch to review tab when processing is complete
      setActiveTab("review");
    } else {
      // Set empty array if we don't have valid data
      setParsedVehicles([]);
      
      // Still navigate to review tab to show the no data message
      setActiveTab("review");
    }
  };

  // Handle when vehicles data is updated
  const handleVehicleDataChange = (updatedVehicles: Record<string, string | number | null>[]) => {
    setParsedVehicles(updatedVehicles as unknown as VehicleImportRow[]);
  };

  // Handle confirm import (show confirmation dialog)
  const handleConfirmImport = (validData: Record<string, string | number | null>[]) => {
    setVehiclesToImport(validData as unknown as VehicleImportRow[]);
    setConfirmDialogOpen(true);
  };

  // Handle actual submission after confirmation
  const handleSubmit = async () => {
    if (isSubmitting || vehiclesToImport.length === 0) return;
    
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      const response = await axios.post(route('vehicles.import.store'), {
        vehicles: vehiclesToImport,
        tenant_id: selectedTenant,
      });
      
      if (response.data.success) {
        setSuccessMessage(__('vehicles.import.success_message', { count: response.data.imported_count }));
        
        // Redirect to index page after 1.5 seconds
        setTimeout(() => {
          router.visit(route('vehicles.index'));
        }, 1500);
      } else {
        console.error('Import failed:', response.data.errors);
      }
    } catch (error) {
      console.error('Error submitting import:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate field descriptions for the table
  const fieldDescriptions = {
    registration: __('vehicles.fields.registration'),
    vin: __('vehicles.fields.vin'),
    vehicle_model_id: __('vehicles.fields.model'),
    vehicle_type_id: __('vehicles.fields.type'),
    year: __('vehicles.fields.year'),
    color: __('vehicles.fields.color'),
    notes: __('vehicles.fields.notes')
  };

  // Field options for the table
  const fieldOptions = {
    vehicle_model_id: vehicleModelOptions,
    vehicle_type_id: vehicleTypes.map(type => ({
      id: type.id,
      name: type.name
    }))
  };

  const breadcrumbs = [
    {
      title: __('vehicles.breadcrumbs.index'),
      href: route('vehicles.index'),
    },
    {
      title: __('vehicles.import.title'),
      href: route('vehicles.import'),
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
      <Head title={__('vehicles.import.title')} />
      
      <VehiclesLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <HeadingSmall 
              title={__('vehicles.import.title')} 
              description={__('vehicles.import.description')}
            />
            <Button variant="outline" asChild>
              <Link href={route('vehicles.index')}>
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
                {__('common.step')} 2: {__('vehicles.import.upload_tab')}
              </TabsTrigger>
              <TabsTrigger 
                value="review" 
                disabled={!isTenantStepComplete()}
              >
                {__('common.step')} 3: {__('vehicles.import.review_tab')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tenant" className="space-y-4">
              <Card>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">{__('vehicles.import.select_tenant_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{__('vehicles.import.select_tenant_desc')}</p>
                    
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="tenant-selector">
                          {__('vehicles.fields.tenant')} <span className="text-destructive">*</span>
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
                          {__('vehicles.import.tenant_required')}
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
                importType="vehicle"
                onImportComplete={handleImportComplete}
                apiEndpoint={route('vehicles.import.upload')}
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
                    data={parsedVehicles as unknown as Record<string, string | number | null>[]}
                    mapping={importData.mapping || {}}
                    warnings={importData.warnings || []}
                    fieldDescriptions={fieldDescriptions}
                    fieldOptions={fieldOptions}
                    mandatoryFields={['vin', 'vehicle_model_id', 'vehicle_type_id']}
                    onDataChange={handleVehicleDataChange}
                    onSubmit={handleSubmit}
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
        </div>
      </VehiclesLayout>
    </AppLayout>
  );
} 