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

import { VehicleBrand } from "../vehicle-brands/columns"
import { VehicleType } from "../vehicle-types/columns"

// Type for our data structure
export interface VehicleModel {
    id: number
    name: string
    year: number
    description: string
    vehicle_brand_id: number
    vehicle_type_id: number
    vehicle_brand: VehicleBrand
    vehicle_type: VehicleType
    created_at: string
    updated_at: string
}

// React component for columns
export function useVehicleModelColumns(): ColumnDef<VehicleModel>[] {
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
            accessorKey: "year",
            header: ({ column }) => (
                <DataTableColumnHeader 
                    column={column} 
                    title={__('common.year')} 
                />
            ),
            cell: ({ row }) => <div>{row.getValue("year")}</div>,
        },
        {
            accessorKey: "vehicle_brand.name",
            header: ({ column }) => (
                <DataTableColumnHeader 
                    column={column} 
                    title={__('common.brand')} 
                />
            ),
            cell: ({ row }) => {
                const brand = row.original.vehicle_brand
                return (
                    <div className="flex items-center">
                        {brand.logo_url && (
                            <img 
                                src={brand.logo_url} 
                                alt={brand.name} 
                                className="h-6 w-6 mr-2 object-contain" 
                            />
                        )}
                        <span>{brand.name}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "vehicle_type.name",
            header: ({ column }) => (
                <DataTableColumnHeader 
                    column={column} 
                    title={__('common.type')} 
                />
            ),
            cell: ({ row }) => <div>{row.original.vehicle_type.name}</div>,
        },
        {
            id: "actions",
            header: () => <div className="text-right">{__('common.actions')}</div>,
            cell: ({ row }) => {
                const vehicleModel = row.original
                
                return (
                    <div className="flex justify-end space-x-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            asChild
                        >
                            <Link href={route('global-settings.vehicle-models.edit', vehicleModel.id)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">{__('common.edit')}</span>
                            </Link>
                        </Button>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">{__('common.delete')}</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{__('common.confirm_delete')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {__('common.delete_confirmation', { item: vehicleModel.name })}
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
                                                form.action = route('global-settings.vehicle-models.destroy', vehicleModel.id);
                                                
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