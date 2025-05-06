"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { Link } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { useTranslation } from "@/utils/translation"
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { usePermission } from "@/utils/permissions"

// Type for our data structure
export interface DeviceType {
    id: number
    name: string
    manufacturer: string
    created_at: string
    updated_at: string
}

// React component for columns
export function useDeviceTypeColumns(): ColumnDef<DeviceType>[] {
    const { __ } = useTranslation()
    const canEditDeviceTypes = usePermission('edit_device_types')
    const canDeleteDeviceTypes = usePermission('delete_device_types')

    return [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader 
                    column={column} 
                    title={__('common.name')} 
                />
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "manufacturer",
            header: ({ column }) => (
                <DataTableColumnHeader 
                    column={column} 
                    title={__('common.manufacturer')} 
                />
            ),
            cell: ({ row }) => <div>{row.getValue("manufacturer")}</div>,
        },
        {
            id: "actions",
            header: () => <div className="text-right">{__('common.actions_header')}</div>,
            cell: ({ row }) => {
                const deviceType = row.original
                
                return (
                    <div className="flex justify-end space-x-2">
                        {canEditDeviceTypes && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                asChild
                            >
                                <Link href={route('global-settings.device-types.edit', deviceType.id)}>
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">{__('common.edit')}</span>
                                </Link>
                            </Button>
                        )}
                        
                        {canDeleteDeviceTypes && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">{__('common.delete')}</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{__('common.delete_confirmation_title')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {__('global_settings.device_types.delete_confirmation', { deviceType: deviceType.name })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{__('common.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                            <button
                                                type="button"
                                                className="bg-red-600 text-white hover:bg-red-700 rounded-md px-4 py-2 text-sm font-medium"
                                                onClick={() => {
                                                    // Use Inertia to submit a DELETE request
                                                    const form = document.createElement('form');
                                                    form.method = 'POST';
                                                    form.action = route('global-settings.device-types.destroy', deviceType.id);
                                                    
                                                    const methodInput = document.createElement('input');
                                                    methodInput.type = 'hidden';
                                                    methodInput.name = '_method';
                                                    methodInput.value = 'DELETE';
                                                    
                                                    const csrfInput = document.createElement('input');
                                                    csrfInput.type = 'hidden';
                                                    csrfInput.name = '_token';
                                                    csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                                    
                                                    form.appendChild(methodInput);
                                                    form.appendChild(csrfInput);
                                                    document.body.appendChild(form);
                                                    form.submit();
                                                }}
                                            >
                                                {__('common.delete')}
                                            </button>
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                )
            },
        },
    ]
} 