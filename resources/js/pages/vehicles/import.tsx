import { useTranslation } from "@/utils/translation";
import VehiclesLayout from "@/layouts/vehicles/layout";
import { PageProps } from "@/types";
import GenericImportPage from "@/components/import/generic-import-page";

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

export default function VehicleImport(props: VehicleImportPageProps) {
  const { __ } = useTranslation();
  const { vehicleTypes, vehicleBrands, tenants } = props;

  // Build vehicle models dropdown
  const vehicleModelOptions = vehicleBrands.flatMap(brand => 
    brand.models.map(model => ({
      id: model.id,
      name: `${brand.name} ${model.name}`
    }))
  );

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

  return (
    <GenericImportPage
      entityType="vehicle"
      pageProps={props}
      breadcrumbs={breadcrumbs}
      layoutComponent={VehiclesLayout}
      uploadApiEndpoint={route('vehicles.import.upload')}
      storeApiEndpoint={route('vehicles.import.store')}
      validateRowApiEndpoint={route('vehicles.import.validate-row')}
      indexRouteName="vehicles.index"
      fieldDescriptions={fieldDescriptions}
      fieldOptions={fieldOptions}
      mandatoryFields={['vin', 'vehicle_model_id', 'vehicle_type_id']}
      tenants={tenants}
    />
  );
} 