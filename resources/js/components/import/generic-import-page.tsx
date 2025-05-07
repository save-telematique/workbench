import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { useTranslation } from "@/utils/translation";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { CsvImportData } from "@/types/csv-import";
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

export interface GenericImportPageProps {
  /**
   * The entity type being imported (e.g., 'device', 'vehicle', 'driver')
   */
  entityType: 'device' | 'vehicle' | 'driver';
  
  /**
   * The Inertia PageProps object
   */
  pageProps: any;
  
  /**
   * The breadcrumbs for the page
   */
  breadcrumbs: Array<{
    title: string;
    href: string;
  }>;
  
  /**
   * Layout component to wrap the page content
   */
  layoutComponent: React.ComponentType<{ children: React.ReactNode }>;
  
  /**
   * API endpoint for CSV upload
   */
  uploadApiEndpoint: string;
  
  /**
   * API endpoint for storing imported data
   */
  storeApiEndpoint: string;
  
  /**
   * API endpoint for row validation
   */
  validateRowApiEndpoint: string;
  
  /**
   * Route name for the index page (to redirect after import)
   */
  indexRouteName: string;
  
  /**
   * Field descriptions for the import table
   */
  fieldDescriptions: Record<string, string>;
  
  /**
   * Optional dropdown options for fields
   */
  fieldOptions?: Record<string, Array<{ id: string | number; name: string }>>;
  
  /**
   * Array of mandatory field names
   */
  mandatoryFields: string[];
  
  /**
   * Available tenants (if any)
   */
  tenants?: Array<{
    id: string;
    name: string;
  }>;
}

export default function GenericImportPage({
  entityType,
  pageProps,
  breadcrumbs,
  layoutComponent: LayoutComponent,
  uploadApiEndpoint,
  storeApiEndpoint,
  validateRowApiEndpoint,
  indexRouteName,
  fieldDescriptions,
  fieldOptions,
  mandatoryFields,
  tenants = []
}: GenericImportPageProps) {
  const { __ } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("tenant");
  const [importData, setImportData] = useState<CsvImportData | null>(null);
  const [parsedEntities, setParsedEntities] = useState<Record<string, string | number | null>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [entitiesToImport, setEntitiesToImport] = useState<Record<string, string | number | null>[]>([]);

  // Handle when import file is analyzed
  const handleImportComplete = (data: CsvImportData) => {
    setImportData(data);
    
    if (data.success && data.data) {
      setParsedEntities(data.data);
      
      // Always switch to review tab when processing is complete
      setActiveTab("review");
    } else {
      // Set empty array if we don't have valid data
      setParsedEntities([]);
      
      // Still navigate to review tab to show the no data message
      setActiveTab("review");
    }
  };

  // Handle when entity data is updated
  const handleEntityDataChange = (updatedEntities: Record<string, string | number | null>[]) => {
    setParsedEntities(updatedEntities);
  };

  // Handle confirm import (show confirmation dialog)
  const handleConfirmImport = (validData: Record<string, string | number | null>[]) => {
    setEntitiesToImport(validData);
    setConfirmDialogOpen(true);
  };

  // Handle actual submission after confirmation
  const handleSubmit = async () => {
    if (isSubmitting || entitiesToImport.length === 0) return;
    
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      const requestBody: Record<string, any> = {
        tenant_id: selectedTenant,
      };
      
      // Use the correct name for the entities array in the request
      requestBody[`${entityType}s`] = entitiesToImport;
      
      const response = await axios.post(storeApiEndpoint, requestBody);
      
      if (response.data.success) {
        setSuccessMessage(__(`${entityType}s.import.success_message`, { count: response.data.imported_count }));
        
        // Redirect to index page after 1.5 seconds
        setTimeout(() => {
          router.visit(route(indexRouteName));
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
      <Head title={__(`${entityType}s.import.title`)} />
      
      <LayoutComponent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <HeadingSmall 
              title={__(`${entityType}s.import.title`)} 
              description={__(`${entityType}s.import.description`)}
            />
            <Button variant="outline" asChild>
              <Link href={route(indexRouteName)}>
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
                {__('common.step')} 2: {__(`${entityType}s.import.upload_tab`)}
              </TabsTrigger>
              <TabsTrigger 
                value="review" 
                disabled={!isTenantStepComplete()}
              >
                {__('common.step')} 3: {__(`${entityType}s.import.review_tab`)}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tenant" className="space-y-4">
              <Card>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">{__(`${entityType}s.import.select_tenant_title`)}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{__(`${entityType}s.import.select_tenant_desc`)}</p>
                    
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="tenant-selector">
                          {__(`${entityType}s.fields.tenant`)} <span className="text-destructive">*</span>
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
                          {__(`${entityType}s.import.tenant_required`)}
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
                importType={entityType}
                onImportComplete={handleImportComplete}
                apiEndpoint={uploadApiEndpoint}
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
                    data={parsedEntities}
                    mapping={importData.mapping || {}}
                    warnings={importData.warnings || []}
                    fieldDescriptions={fieldDescriptions}
                    fieldOptions={fieldOptions}
                    mandatoryFields={mandatoryFields}
                    onDataChange={handleEntityDataChange}
                    onSubmit={handleConfirmImport}
                    isSubmitting={isSubmitting}
                    successMessage={successMessage}
                    entityType={entityType}
                    validateRowEndpoint={validateRowApiEndpoint}
                    tenantId={selectedTenant}
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
                <AlertDialogTitle>{__(`${entityType}s.import.confirm_title`)}</AlertDialogTitle>
                <AlertDialogDescription>
                  {__(`${entityType}s.import.confirm_description_valid_only`)}
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
      </LayoutComponent>
    </AppLayout>
  );
} 