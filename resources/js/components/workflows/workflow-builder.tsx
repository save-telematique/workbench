import React, { useState, useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import { Save, Plus, Trash2, Zap, Filter, Target, ChevronDown, Copy, ArrowDown, ArrowRight, Settings } from 'lucide-react';
import { Transition } from '@headlessui/react';

import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WorkflowResource } from '@/types/resources';
import InputError from '@/components/input-error';


interface WorkflowBuilderProps {
    workflow?: WorkflowResource;
    events?: Array<{ key: string; label: string; category: string }>;
    operators?: Array<{ key: string; label: string }>;
    actionTypes?: Array<{ key: string; label: string; category: string }>;
    onCancel?: () => void;
}

interface WorkflowTrigger {
    id: string;
    event: string;
    conditions: Record<string, unknown>;
    is_active: boolean;
}

interface WorkflowCondition {
    id: string;
    field: string;
    operator: string;
    value: unknown;
    logical_operator: string;
}

interface WorkflowAction {
    id: string;
    action_type: string;
    parameters: Record<string, unknown>;
    order: number;
}

// Available variables that users can use in conditions and actions
const AVAILABLE_VARIABLES = {
    device: [
        { key: 'device.id', label: 'Device ID', type: 'string', description: 'Unique identifier of the device' },
        { key: 'device.name', label: 'Device Name', type: 'string', description: 'Name of the device' },
        { key: 'device.status', label: 'Device Status', type: 'string', description: 'Current status of the device' },
    ],
    vehicle: [
        { key: 'vehicle.id', label: 'Vehicle ID', type: 'string', description: 'Unique identifier of the vehicle' },
        { key: 'vehicle.registration', label: 'Registration', type: 'string', description: 'Vehicle registration number' },
        { key: 'vehicle.vin', label: 'VIN', type: 'string', description: 'Vehicle identification number' },
        { key: 'vehicle.odometer', label: 'Odometer', type: 'number', description: 'Current mileage/odometer reading' },
    ],
    location: [
        { key: 'location.latitude', label: 'Latitude', type: 'number', description: 'GPS latitude coordinate' },
        { key: 'location.longitude', label: 'Longitude', type: 'number', description: 'GPS longitude coordinate' },
        { key: 'location.speed', label: 'Speed', type: 'number', description: 'Current speed in km/h' },
        { key: 'location.heading', label: 'Heading', type: 'number', description: 'Direction in degrees (0-360)' },
        { key: 'location.altitude', label: 'Altitude', type: 'number', description: 'Altitude in meters' },
    ],
};

// Action parameter definitions based on WorkflowActionType enum
interface ParameterOption {
    value: string;
    label: string;
}

interface BaseParameter {
    type: string;
    label: string;
    required: boolean;
}

interface InputParameter extends BaseParameter {
    type: 'input' | 'textarea';
    placeholder: string;
}

interface SelectParameter extends BaseParameter {
    type: 'select';
    options: ParameterOption[];
}

type ActionParameter = InputParameter | SelectParameter;

const ACTION_PARAMETERS: Record<string, Record<string, ActionParameter>> = {
    log_alert: {
        message: { 
            type: 'textarea', 
            label: 'workflows.parameters.message', 
            required: true,
            placeholder: 'workflows.placeholders.log_message'
        },
        level: { 
            type: 'select', 
            label: 'workflows.parameters.level', 
            required: true,
            options: [
                { value: 'debug', label: 'workflows.log_levels.debug' },
                { value: 'info', label: 'workflows.log_levels.info' },
                { value: 'warning', label: 'workflows.log_levels.warning' },
                { value: 'error', label: 'workflows.log_levels.error' },
                { value: 'critical', label: 'workflows.log_levels.critical' }
            ]
        }
    },
    create_alert: {
        title: { 
            type: 'input', 
            label: 'workflows.parameters.title', 
            required: true,
            placeholder: 'workflows.placeholders.alert_title'
        },
        content: { 
            type: 'textarea', 
            label: 'workflows.parameters.content', 
            required: true,
            placeholder: 'workflows.placeholders.alert_content'
        },
        severity: { 
            type: 'select', 
            label: 'workflows.parameters.severity', 
            required: true,
            options: [
                { value: 'info', label: 'workflows.alert_types.info' },
                { value: 'warning', label: 'workflows.alert_types.warning' },
                { value: 'error', label: 'workflows.alert_types.error' },
                { value: 'success', label: 'workflows.alert_types.success' }
            ]
        }
    }
};

// Variable picker component
const VariablePicker = ({ onSelect, className }: { onSelect: (variable: string) => void; className?: string }) => {
    const { __ } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={className}>
                    <Settings className="h-4 w-4 mr-2" />
                    {__('workflows.builder.variables')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3 border-b">
                    <h4 className="font-medium">{__('workflows.builder.available_variables')}</h4>
                    <p className="text-sm text-muted-foreground">{__('workflows.builder.variables_description')}</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {Object.entries(AVAILABLE_VARIABLES).map(([category, variables]) => (
                        <Collapsible key={category} defaultOpen>
                            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium hover:bg-muted">
                                <span className="capitalize">{__(`workflows.variable_categories.${category}`)}</span>
                                <ChevronDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="space-y-1 pb-2">
                                    {variables.map((variable) => (
                                        <button
                                            key={variable.key}
                                            onClick={() => {
                                                onSelect(variable.key);
                                                setIsOpen(false);
                                            }}
                                            className="w-full px-6 py-2 text-left hover:bg-muted group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-medium">{variable.label}</div>
                                                    <div className="text-xs text-muted-foreground">{variable.description}</div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {variable.type}
                                                    </Badge>
                                                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

// Action parameters component
const ActionParametersEditor = ({ 
    action, 
    onParameterChange 
}: { 
    action: WorkflowAction; 
    onParameterChange: (parameterId: string, value: string) => void;
}) => {
    const { __ } = useTranslation();
    
    if (!action.action_type || !ACTION_PARAMETERS[action.action_type]) {
        return null;
    }

    const parameters = ACTION_PARAMETERS[action.action_type];

    return (
        <div className="space-y-4 mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">
                {__('workflows.builder.action_parameters')}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(parameters).map(([paramKey, paramConfig]) => (
                    <div key={paramKey} className="space-y-2">
                        <Label className="text-sm font-medium">
                            {__(paramConfig.label)}
                            {paramConfig.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        
                        {(paramConfig.type === 'input' || paramConfig.type === 'textarea') && (
                            <div className="relative">
                                {paramConfig.type === 'input' ? (
                                    <Input
                                        value={(action.parameters[paramKey] as string) || ''}
                                        onChange={(e) => onParameterChange(paramKey, e.target.value)}
                                        placeholder={__((paramConfig as InputParameter).placeholder)}
                                        required={paramConfig.required}
                                    />
                                ) : (
                                    <Textarea
                                        value={(action.parameters[paramKey] as string) || ''}
                                        onChange={(e) => onParameterChange(paramKey, e.target.value)}
                                        placeholder={__((paramConfig as InputParameter).placeholder)}
                                        rows={3}
                                        className="resize-none pr-20"
                                        required={paramConfig.required}
                                    />
                                )}
                                <VariablePicker 
                                    onSelect={(variable) => {
                                        const currentValue = (action.parameters[paramKey] as string) || '';
                                        onParameterChange(paramKey, currentValue + `{${variable}}`);
                                    }}
                                    className="absolute right-1 top-1 h-8 px-2"
                                />
                            </div>
                        )}
                        
                        {paramConfig.type === 'select' && (
                            <Select
                                value={(action.parameters[paramKey] as string) || ''}
                                onValueChange={(value) => onParameterChange(paramKey, value)}
                                required={paramConfig.required}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={__('workflows.builder.select_option')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(paramConfig as SelectParameter).options.map((option: ParameterOption) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {__(option.label)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Visual flow connector component
const FlowConnector = ({ direction = 'down' }: { direction?: 'down' | 'right' }) => (
    <div className="flex justify-center my-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-muted bg-background">
            {direction === 'down' ? (
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
            ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
            )}
        </div>
    </div>
);

export default function WorkflowBuilder({ 
    workflow, 
    events = [], 
    operators = [], 
    actionTypes = [],
    onCancel
}: WorkflowBuilderProps) {
    const { __ } = useTranslation();
    
    const [triggers, setTriggers] = useState<WorkflowTrigger[]>(
        workflow?.triggers?.map(t => ({
            id: t.id,
            event: t.event,
            conditions: t.conditions || {},
            is_active: t.is_active
        })) || []
    );
    
    const [conditions, setConditions] = useState<WorkflowCondition[]>(
        workflow?.conditions?.map(c => ({
            id: c.id,
            field: c.field,
            operator: c.operator,
            value: c.value,
            logical_operator: c.logical_operator
        })) || []
    );
    
    const [actions, setActions] = useState<WorkflowAction[]>(
        workflow?.actions?.map(a => ({
            id: a.id,
            action_type: a.action_type,
            parameters: a.parameters || {},
            order: a.order
        })) || []
    );

    const { data, setData, post, put, processing, errors, recentlySuccessful } = useForm({
        name: workflow?.name || '',
        description: workflow?.description || '',
        is_active: workflow?.is_active || false,
        triggers: JSON.stringify(triggers),
        conditions: JSON.stringify(conditions),
        actions: JSON.stringify(actions),
    });

    const addTrigger = useCallback(() => {
        const newTrigger: WorkflowTrigger = {
            id: `trigger_${Date.now()}`,
            event: '',
            conditions: {},
            is_active: true,
        };
        const updatedTriggers = [...triggers, newTrigger];
        setTriggers(updatedTriggers);
        setData('triggers', JSON.stringify(updatedTriggers));
    }, [triggers, setData]);

    const removeTrigger = useCallback((id: string) => {
        const updatedTriggers = triggers.filter(t => t.id !== id);
        setTriggers(updatedTriggers);
        setData('triggers', JSON.stringify(updatedTriggers));
    }, [triggers, setData]);

    const updateTrigger = useCallback((id: string, updates: Partial<WorkflowTrigger>) => {
        const updatedTriggers = triggers.map(t => t.id === id ? { ...t, ...updates } : t);
        setTriggers(updatedTriggers);
        setData('triggers', JSON.stringify(updatedTriggers));
    }, [triggers, setData]);

    const addCondition = useCallback(() => {
        const newCondition: WorkflowCondition = {
            id: `condition_${Date.now()}`,
            field: '',
            operator: 'equals',
            value: '',
            logical_operator: 'AND',
        };
        const updatedConditions = [...conditions, newCondition];
        setConditions(updatedConditions);
        setData('conditions', JSON.stringify(updatedConditions));
    }, [conditions, setData]);

    const removeCondition = useCallback((id: string) => {
        const updatedConditions = conditions.filter(c => c.id !== id);
        setConditions(updatedConditions);
        setData('conditions', JSON.stringify(updatedConditions));
    }, [conditions, setData]);

    const updateCondition = useCallback((id: string, updates: Partial<WorkflowCondition>) => {
        const updatedConditions = conditions.map(c => c.id === id ? { ...c, ...updates } : c);
        setConditions(updatedConditions);
        setData('conditions', JSON.stringify(updatedConditions));
    }, [conditions, setData]);

    const addAction = useCallback(() => {
        const newAction: WorkflowAction = {
            id: `action_${Date.now()}`,
            action_type: '',
            parameters: {},
            order: actions.length + 1,
        };
        const updatedActions = [...actions, newAction];
        setActions(updatedActions);
        setData('actions', JSON.stringify(updatedActions));
    }, [actions, setData]);

    const removeAction = useCallback((id: string) => {
        const updatedActions = actions.filter(a => a.id !== id);
        setActions(updatedActions);
        setData('actions', JSON.stringify(updatedActions));
    }, [actions, setData]);

    const updateAction = useCallback((id: string, updates: Partial<WorkflowAction>) => {
        const updatedActions = actions.map(a => a.id === id ? { ...a, ...updates } : a);
        setActions(updatedActions);
        setData('actions', JSON.stringify(updatedActions));
    }, [actions, setData]);

    const updateActionParameter = useCallback((actionId: string, paramKey: string, value: string) => {
        const updatedActions = actions.map(a => 
            a.id === actionId 
                ? { ...a, parameters: { ...a.parameters, [paramKey]: value } }
                : a
        );
        setActions(updatedActions);
        setData('actions', JSON.stringify(updatedActions));
    }, [actions, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate triggers
        const hasInvalidTriggers = triggers.some(trigger => !trigger.event.trim());
        if (hasInvalidTriggers) {
            alert(__('workflows.validation.trigger_event_required'));
            return;
        }

        // Update form data with current builder state
        setData(prev => ({
            ...prev,
            triggers: JSON.stringify(triggers),
            conditions: JSON.stringify(conditions),
            actions: JSON.stringify(actions),
        }));

        // Submit after a brief delay to ensure state is updated
        setTimeout(() => {
            if (workflow) {
                put(route('workflows.update', { workflow: workflow.id }));
            } else {
                post(route('workflows.store'));
            }
        }, 10);
    };



    const eventsByCategory = events.reduce((acc, event) => {
        if (!acc[event.category]) acc[event.category] = [];
        acc[event.category].push(event);
        return acc;
    }, {} as Record<string, typeof events>);

    const actionsByCategory = actionTypes.reduce((acc, action) => {
        if (!acc[action.category]) acc[action.category] = [];
        acc[action.category].push(action);
        return acc;
    }, {} as Record<string, typeof actionTypes>);

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            {__('workflows.builder.basic_info')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    {__('workflows.fields.name')} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={__('workflows.placeholders.name')}
                                    className="h-10"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="flex items-center space-x-3 pt-7">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked || false)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-medium">
                                    {__('workflows.fields.is_active')}
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                                {__('workflows.fields.description')}
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder={__('workflows.placeholders.description')}
                                rows={3}
                                className="resize-none"
                            />
                            <InputError message={errors.description} />
                        </div>
                    </CardContent>
                </Card>

                {/* Visual Workflow Flow */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">{__('workflows.builder.workflow_flow')}</h3>
                        <p className="text-sm text-muted-foreground">{__('workflows.builder.flow_description')}</p>
                    </div>

                    {/* Triggers Section */}
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <Zap className="h-5 w-5" />
                                    {__('workflows.components.triggers')} ({triggers.length})
                                </CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addTrigger}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {__('workflows.builder.add_trigger')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {triggers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <h4 className="font-medium mb-2">{__('workflows.builder.no_triggers')}</h4>
                                    <p className="text-sm">{__('workflows.builder.triggers_help')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {triggers.map((trigger, index) => (
                                        <Card key={trigger.id} className="border border-blue-200 dark:border-blue-800">
                                            <CardContent className="pt-4">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                            <Zap className="h-3 w-3 mr-1" />
                                                            {__('workflows.builder.trigger')} {index + 1}
                                                        </Badge>
                                                        {trigger.is_active && (
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeTrigger(trigger.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">
                                                            {__('workflows.builder.event_type')} <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={trigger.event}
                                                            onValueChange={(value) => updateTrigger(trigger.id, { event: value })}
                                                        >
                                                            <SelectTrigger className={!trigger.event ? "border-red-300" : ""}>
                                                                <SelectValue placeholder={__('workflows.builder.select_event')} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(eventsByCategory).map(([category, categoryEvents]) => (
                                                                    <div key={category}>
                                                                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                                                                            {__(category)}
                                                                        </div>
                                                                        {categoryEvents.map((event) => (
                                                                            <SelectItem key={event.key} value={event.key}>
                                                                                {__(event.label)}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-3 pt-7">
                                                        <Switch
                                                            checked={trigger.is_active}
                                                            onCheckedChange={(checked) => updateTrigger(trigger.id, { is_active: checked || false })}
                                                        />
                                                        <Label className="text-sm">{__('workflows.fields.is_active')}</Label>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Flow Connector */}
                    {(triggers.length > 0 || conditions.length > 0) && <FlowConnector />}

                    {/* Conditions Section */}
                    <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                                    <Filter className="h-5 w-5" />
                                    {__('workflows.components.conditions')} ({conditions.length})
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <VariablePicker onSelect={(variable) => {
                                        // Could be enhanced to insert into active field
                                        console.log('Selected variable:', variable);
                                    }} />
                                    <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {__('workflows.builder.add_condition')}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {conditions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <h4 className="font-medium mb-2">{__('workflows.builder.no_conditions')}</h4>
                                    <p className="text-sm">{__('workflows.builder.conditions_help')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {conditions.map((condition, index) => (
                                        <Card key={condition.id} className="border border-yellow-200 dark:border-yellow-800">
                                            <CardContent className="pt-4">
                                                <div className="flex items-start justify-between mb-4">
                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                                                        <Filter className="h-3 w-3 mr-1" />
                                                        {__('workflows.builder.condition')} {index + 1}
                                                    </Badge>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeCondition(condition.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">{__('workflows.builder.field')}</Label>
                                                        <div className="relative">
                                                            <Input
                                                                value={condition.field}
                                                                onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                                                                placeholder={__('workflows.builder.field_placeholder')}
                                                            />
                                                            <VariablePicker 
                                                                onSelect={(variable) => updateCondition(condition.id, { field: variable })}
                                                                className="absolute right-1 top-1 h-8 px-2"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">{__('workflows.builder.operator')}</Label>
                                                        <Select
                                                            value={condition.operator}
                                                            onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {operators.map((operator) => (
                                                                    <SelectItem key={operator.key} value={operator.key}>
                                                                        {__(operator.label)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">{__('workflows.builder.value')}</Label>
                                                        <Input
                                                            value={condition.value as string}
                                                            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                                            placeholder={__('workflows.builder.value_placeholder')}
                                                        />
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">{__('workflows.builder.logical_operator')}</Label>
                                                        <Select
                                                            value={condition.logical_operator}
                                                            onValueChange={(value) => updateCondition(condition.id, { logical_operator: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="AND">AND</SelectItem>
                                                                <SelectItem value="OR">OR</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Flow Connector */}
                    {((triggers.length > 0 || conditions.length > 0) && actions.length > 0) && <FlowConnector />}

                    {/* Actions Section */}
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                    <Target className="h-5 w-5" />
                                    {__('workflows.components.actions')} ({actions.length})
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <VariablePicker onSelect={(variable) => {
                                        // Could be enhanced to insert into active field
                                        console.log('Selected variable:', variable);
                                    }} />
                                    <Button type="button" variant="outline" size="sm" onClick={addAction}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {__('workflows.builder.add_action')}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {actions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <h4 className="font-medium mb-2">{__('workflows.builder.no_actions')}</h4>
                                    <p className="text-sm">{__('workflows.builder.actions_help')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {actions.map((action, index) => (
                                        <Card key={action.id} className="border border-green-200 dark:border-green-800">
                                            <CardContent className="pt-4">
                                                <div className="flex items-start justify-between mb-4">
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                        <Target className="h-3 w-3 mr-1" />
                                                        {__('workflows.builder.action')} {index + 1}
                                                    </Badge>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeAction(action.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">{__('workflows.builder.action_type')}</Label>
                                                        <Select
                                                            value={action.action_type}
                                                            onValueChange={(value) => updateAction(action.id, { action_type: value, parameters: {} })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={__('workflows.builder.select_action')} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(actionsByCategory).map(([category, categoryActions]) => (
                                                                    <div key={category}>
                                                                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                                                                            {__(category)}
                                                                        </div>
                                                                        {categoryActions.map((actionType) => (
                                                                            <SelectItem key={actionType.key} value={actionType.key}>
                                                                                {__(actionType.label)}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    
                                                    {/* Dynamic Action Parameters */}
                                                    <ActionParametersEditor
                                                        action={action}
                                                        onParameterChange={(paramKey, value) => 
                                                            updateActionParameter(action.id, paramKey, value)
                                                        }
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onCancel}
                        disabled={processing}
                    >
                        {__('common.cancel')}
                    </Button>
                    
                    <div className="flex items-center gap-4">
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">
                                {__('common.saved')}
                            </p>
                        </Transition>
                        
                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? __('common.saving') : (workflow ? __('common.update') : __('workflows.actions.create'))}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
} 