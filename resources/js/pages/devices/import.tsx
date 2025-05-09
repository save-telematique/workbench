import { useTranslation } from "@/utils/translation";
import DevicesLayout from "@/layouts/devices/layout";
import { PageProps } from "@/types";
import GenericImportPage from "@/components/import/generic-import-page";
import { FieldType } from "@/components/editable-import-table";
import { DeviceTypeResource, TenantResource } from "@/types";

interface DeviceImportPageProps extends PageProps {
  deviceTypes: DeviceTypeResource[];
  tenants: TenantResource[];
}

export default function DeviceImport(props: DeviceImportPageProps) {
  const { __ } = useTranslation();
  const { deviceTypes, tenants } = props;

  // Prepare device types for dropdown
  const deviceTypeOptions = deviceTypes.map(type => ({
    id: type.id,
    name: `${type.name} (${type.manufacturer})`
  }));

  // Generate field descriptions for the table
  const fieldDescriptions = {
    device_type_id: __('devices.fields.device_type'),
    serial_number: __('devices.fields.serial_number'),
    imei: __('devices.fields.imei'),
    sim_number: __('devices.fields.sim_number'),
    firmware_version: __('devices.fields.firmware_version')
  };

  // Field options for the table
  const fieldOptions = {
    device_type_id: deviceTypeOptions
  };

  const fieldTypes: Record<string, FieldType> = {
    device_type_id: 'select',
    serial_number: 'text',
    imei: 'text',
    sim_number: 'text',
    firmware_version: 'text',
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

  return (
    <GenericImportPage
      entityType="device"
      pageProps={props}
      breadcrumbs={breadcrumbs}
      layoutComponent={DevicesLayout}
      uploadApiEndpoint={route('devices.import.upload')}
      storeApiEndpoint={route('devices.import.store')}
      validateRowApiEndpoint={route('devices.import.validate-row')}
      indexRouteName="devices.index"
      fieldDescriptions={fieldDescriptions}
      fieldOptions={fieldOptions}
      mandatoryFields={['device_type_id', 'serial_number', 'imei']}
      tenants={tenants}
      fieldTypes={fieldTypes}
    />
  );
} 