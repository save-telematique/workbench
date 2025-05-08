import { useTranslation } from "@/utils/translation";
import DriversLayout from "@/layouts/drivers/layout";
import { PageProps } from "@/types";
import GenericImportPage from "@/components/import/generic-import-page";
import { FieldType } from "@/components/editable-import-table";

interface DriverImportPageProps extends PageProps {
  tenants: Array<{
    id: string;
    name: string;
  }>;
}

export default function DriverImport(props: DriverImportPageProps) {
  const { __ } = useTranslation();
  const { tenants } = props;

  const fieldTypes: Record<string, FieldType> = {
    firstname: 'text',
    surname: 'text',
    license_number: 'text',
    card_number: 'text',
    birthdate: 'date',
    phone: 'text',
    card_issuing_country: 'text',
    card_issuing_date: 'date',
    card_expiration_date: 'date',
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

  return (
    <GenericImportPage
      entityType="driver"
      pageProps={props}
      breadcrumbs={breadcrumbs}
      layoutComponent={DriversLayout}
      uploadApiEndpoint={route('drivers.import.upload')}
      storeApiEndpoint={route('drivers.import.store')}
      validateRowApiEndpoint={route('drivers.import.validate-row')} // Ensure this route exists on the backend
      indexRouteName="drivers.index"
      fieldDescriptions={fieldDescriptions}
      fieldOptions={{}} // Drivers import doesn't have specific dropdowns beyond tenant selection
      mandatoryFields={['firstname', 'surname', 'license_number']}
      tenants={tenants}
      fieldTypes={fieldTypes}
    />
  );
} 