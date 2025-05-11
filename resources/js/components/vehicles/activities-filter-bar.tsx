import { useTranslation } from '@/utils/translation';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format, startOfToday } from 'date-fns';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { ActivityResource, DriverResource } from '@/types/resources';
import { Card, CardContent } from '@/components/ui/card';

interface ActivitiesFilterBarProps {
    drivers: DriverResource[];
    activities: ActivityResource[];
    initialFilters: {
        start_date?: string;
        end_date?: string;
        driver_id?: string;
        activity_id?: number;
        view_mode?: string;
    };
}

interface FilterFormValues {
    start_date?: Date;
    end_date?: Date;
    driver_id?: string;
    activity_id?: number;
}

export function ActivitiesFilterBar({ drivers, activities, initialFilters }: ActivitiesFilterBarProps) {
    const { __ } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const today = startOfToday();

    // Format date strings to Date objects for the form
    const formattedInitialValues: FilterFormValues = {
        start_date: initialFilters.start_date ? new Date(initialFilters.start_date) : today,
        end_date: initialFilters.end_date ? new Date(initialFilters.end_date) : today,
        driver_id: initialFilters.driver_id,
        activity_id: initialFilters.activity_id ? Number(initialFilters.activity_id) : undefined,
    };

    const form = useForm<FilterFormValues>({
        defaultValues: formattedInitialValues,
    });

    useEffect(() => {
        // If no filters are set, auto-submit with default dates
        if (!initialFilters.start_date && !initialFilters.end_date) {
            onSubmit(formattedInitialValues);
        }
    }, []);

    function onSubmit(values: FilterFormValues) {
        setIsSubmitting(true);

        // Format dates to strings for the query
        const formattedValues = {
            ...values,
            start_date: values.start_date ? format(values.start_date, 'yyyy-MM-dd') : undefined,
            end_date: values.end_date ? format(values.end_date, 'yyyy-MM-dd') : undefined,
            view_mode: initialFilters.view_mode, // Preserve view mode
        };

        // Only include defined values
        const queryParams = Object.fromEntries(
            Object.entries(formattedValues).filter(([, v]) => v !== undefined)
        );

        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            onSuccess: () => setIsSubmitting(false),
        });
        
        setIsFilterOpen(false);
    }

    function resetFilters() {
        form.reset({
            start_date: today,
            end_date: today,
            driver_id: undefined,
            activity_id: undefined,
        });

        router.get(window.location.pathname, { 
            start_date: format(today, 'yyyy-MM-dd'),
            end_date: format(today, 'yyyy-MM-dd'),
            view_mode: initialFilters.view_mode 
        }, {
            preserveState: true,
        });
        
        setIsFilterOpen(false);
    }

    const hasActiveFilters = 
        form.getValues().driver_id !== undefined || 
        form.getValues().activity_id !== undefined;

    // Display the active date range
    const dateRangeDisplay = () => {
        const start = form.getValues().start_date;
        const end = form.getValues().end_date;
        
        if (start && end) {
            if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
                return format(start, 'PP');
            }
            return `${format(start, 'PP')} - ${format(end, 'PP')}`;
        }
        return __('vehicles.activities.filters.date_range');
    };

    return (
        <Form {...form}>
            <div className="flex items-center gap-2 mb-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    {__('vehicles.activities.filters.filter')}
                    {hasActiveFilters && (
                        <span className="ml-1 rounded-full bg-primary w-2 h-2"></span>
                    )}
                </Button>
                
                <div className="text-sm text-muted-foreground">
                    {dateRangeDisplay()}
                    {hasActiveFilters && (
                        <>
                            {form.getValues().driver_id && (
                                <span className="ml-2 px-2 py-0.5 bg-muted rounded-md text-xs">
                                    {__('vehicles.activities.filters.driver')}: {
                                        drivers.find(d => d.id === form.getValues().driver_id)?.firstname
                                    } {
                                        drivers.find(d => d.id === form.getValues().driver_id)?.surname
                                    }
                                </span>
                            )}
                            {form.getValues().activity_id && (
                                <span className="ml-2 px-2 py-0.5 bg-muted rounded-md text-xs">
                                    {__('vehicles.activities.filters.activity')}: {
                                        activities.find(a => a.id === form.getValues().activity_id)?.name
                                    }
                                </span>
                            )}
                        </>
                    )}
                </div>
                
                {hasActiveFilters && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetFilters}
                        className="h-8 px-2"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            
            {isFilterOpen && (
                <Card className="mb-4">
                    <CardContent className="pt-4">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                <FormField
                                    control={form.control}
                                    name="start_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>{__('common.filters.start_date')}</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, 'PP')
                                                            ) : (
                                                                <span>{__('common.select_date')}</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => {
                                                            const endDate = form.getValues('end_date');
                                                            return Boolean(date > new Date() || (endDate && date > endDate));
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="end_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>{__('common.filters.end_date')}</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, 'PP')
                                                            ) : (
                                                                <span>{__('common.select_date')}</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => {
                                                            const startDate = form.getValues('start_date');
                                                            return Boolean(date > new Date() || (startDate && date < startDate));
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="driver_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{__('vehicles.activities.filters.driver')}</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={__('vehicles.activities.filters.all_drivers')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {drivers.map((driver) => (
                                                        <SelectItem key={driver.id} value={driver.id}>
                                                            {driver.firstname} {driver.surname}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="activity_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{__('vehicles.activities.filters.activity')}</FormLabel>
                                            <Select
                                                value={field.value?.toString()}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={__('vehicles.activities.filters.all_activities')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {activities.map((activity) => (
                                                        <SelectItem key={activity.id} value={activity.id.toString()}>
                                                            {activity.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="h-8"
                                >
                                    {__('common.reset')}
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="h-8"
                                >
                                    {__('common.apply')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </Form>
    );
} 