"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { Link } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
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
import { VehicleBrandResource } from "@/types/resources"

export function useVehicleBrandColumns(): ColumnDef<VehicleBrandResource>[] {
    const { __ } = useTranslation()

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
            id: "actions",
            header: () => <div className="text-right">{__('common.actions_header')}</div>,
            cell: ({ row }) => {
                const vehicleBrand = row.original
                
                return (
                    <div className="flex justify-end space-x-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            asChild
                        >
                            <Link href={route('global-settings.vehicle-brands.edit', { vehicle_brand: vehicleBrand.id })}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">{__('common.edit')}</span>
                            </Link>
                        </Button>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">{__('common.delete')}</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{__('common.confirm_delete')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {__('common.delete_confirmation', { item: vehicleBrand.name })}
                                        <br />
                                        {__('common.operation_cannot_be_undone')}
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
                                                form.action = route('global-settings.vehicle-brands.destroy', { vehicle_brand: vehicleBrand.id });
                                                
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
                    </div>
                )
            },
        },
    ]
} 