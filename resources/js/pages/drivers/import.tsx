import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import DriversLayout from "@/layouts/drivers/layout";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { CsvImportData, DriverImportRow } from "@/types/csv-import";
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

interface DriverImportPageProps extends PageProps {
  tenants: Array<{
    id: string;
    name: string;
  }>;
}

export default function DriverImport({ tenants }: DriverImportPageProps) {
  const { __ } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("tenant");
  const [importData, setImportData] = useState<CsvImportData | null>(null);
  const [parsedDrivers, setParsedDrivers] = useState<DriverImportRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [driversToImport, setDriversToImport] = useState<DriverImportRow[]>([]);

  // Handle when import file is analyzed
  const handleImportComplete = (data: CsvImportData) => {
    setImportData(data);
    
    if (data.success && data.data) {
      // Map to DriverImportRow type for type safety
      const typedDrivers = data.data.map(item => ({
        firstname: String(item.firstname) || null,
        surname: String(item.surname) || null,
        license_number: String(item.license_number) || null,
        card_number: item.card_number ? String(item.card_number) : null,
        birthdate: item.birthdate ? String(item.birthdate) : null,
        phone: item.phone ? String(item.phone) : null,
        card_issuing_country: item.card_issuing_country ? String(item.card_issuing_country) : null,
        card_issuing_date: item.card_issuing_date ? String(item.card_issuing_date) : null,
        card_expiration_date: item.card_expiration_date ? String(item.card_expiration_date) : null
      })) as DriverImportRow[];
      
      setParsedDrivers(typedDrivers);
      
      // Always switch to review tab when processing is complete
      setActiveTab("review");
    } else {
      // Set empty array if we don't have valid data
      setParsedDrivers([]);
      
      // Still navigate to review tab to show the no data message
      setActiveTab("review");
    }
  };

  // Handle when drivers data is updated
  const handleDriverDataChange = (updatedDrivers: Record<string, string | number | null>[]) => {
    // Force type as DriverImportRow[] to match the state type
    setParsedDrivers(updatedDrivers as unknown as DriverImportRow[]);
  };

  // Handle confirm import (show confirmation dialog)
  const handleConfirmImport = (validData: Record<string, string | number | null>[]) => {
    setDriversToImport(validData as unknown as DriverImportRow[]);
    setConfirmDialogOpen(true);
  };

  // Handle actual submission after confirmation
  const handleSubmit = async () => {
    if (isSubmitting || driversToImport.length === 0) return;
    
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      const response = await axios.post(route('drivers.import.store'), {
        drivers: driversToImport,
        tenant_id: selectedTenant,
      });
      
      if (response.data.success) {
        setSuccessMessage(__('drivers.import.success_message', { count: response.data.imported_count }));
        
        // Redirect to index page after 1.5 seconds
        setTimeout(() => {
          router.visit(route('drivers.index'));
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
    firstname: __('drivers.fields.firstname'),
    surname: __('drivers.fields.surname'),
    license_number: __('drivers.fields.license_number'),
    card_number: __('drivers.fields.card_number'),
    birthdate: __('drivers.fields.birthdate'),
    phone: __('drivers.fields.phone'),
    card_issuing_country: __('drivers.fields.card_issuing_country'),
    card_issuing_date: __('drivers.fields.card_issuing_date'),
    card_expiration_date: __('drivers.fields.card_expiration_date')
  };

  const breadcrumbs = [
    {
      title: __('drivers.breadcrumbs.index'),
      href: route('drivers.index'),
    },
    {
      title: __('drivers.import.title'),
      href: route('drivers.import'),
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
      <Head title={__('drivers.import.title')} />
      
      <DriversLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <HeadingSmall 
              title={__('drivers.import.title')} 
              description={__('drivers.import.description')}
            />
            <Button variant="outline" asChild>
              <Link href={route('drivers.index')}>
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
                {__('common.step')} 2: {__('drivers.import.upload_tab')}
              </TabsTrigger>
              <TabsTrigger 
                value="review" 
                disabled={!isTenantStepComplete()}
              >
                {__('common.step')} 3: {__('drivers.import.review_tab')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tenant" className="space-y-4">
              <Card>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">{__('drivers.import.select_tenant_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{__('drivers.import.select_tenant_desc')}</p>
                    
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="tenant-selector">
                          {__('drivers.fields.tenant')} <span className="text-destructive">*</span>
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
                          {__('drivers.import.tenant_required')}
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
                importType="driver"
                onImportComplete={handleImportComplete}
                apiEndpoint={route('drivers.import.upload')}
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
                    data={parsedDrivers as unknown as Record<string, string | number | null>[]}
                    mapping={importData.mapping || {}}
                    warnings={importData.warnings || []}
                    fieldDescriptions={fieldDescriptions}
                    fieldOptions={{}}
                    mandatoryFields={['firstname', 'surname', 'license_number']}
                    onDataChange={handleDriverDataChange}
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
                <AlertDialogTitle>{__('drivers.import.confirm_title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {__('drivers.import.confirm_description', { count: driversToImport.length })}
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
      </DriversLayout>
    </AppLayout>
  );
} 