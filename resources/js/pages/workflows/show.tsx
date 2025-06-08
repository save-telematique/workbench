import { Head, Link } from '@inertiajs/react';
import { Edit, Trash2, Zap, Filter, Target, ArrowDown, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from '@/utils/translation';
import { usePermission } from '@/utils/permissions';
import { formatDate } from '@/utils/format';
import AppLayout from '@/layouts/app-layout';
import WorkflowsLayout from '@/layouts/workflows/layout';

import type { PageProps, BreadcrumbItem } from '@/types';
import type { WorkflowResource } from '@/types/resources';

// Using types from resources.ts

interface Props extends PageProps {
    workflow: WorkflowResource;
}

export default function WorkflowShow({ workflow }: Props) {
    const { __ } = useTranslation();
    const canEditWorkflows = usePermission('edit_workflows');
    const canDeleteWorkflows = usePermission('delete_workflows');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('workflows.breadcrumbs.index'),
            href: route('workflows.index'),
        },
        {
            title: workflow.name,
            href: route('workflows.show', { workflow: workflow.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={workflow.name} />
            <WorkflowsLayout showSidebar={true} workflow={workflow}>
                <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {workflow.name}
                            </h1>
                            <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                                {workflow.is_active ? __('workflows.status.active') : __('workflows.status.inactive')}
                            </Badge>
                        </div>
                        {workflow.description && (
                            <p className="text-muted-foreground">
                                {workflow.description}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        {canEditWorkflows && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('workflows.edit', { workflow: workflow.id })}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {__('common.actions.edit')}
                                </Link>
                            </Button>
                        )}
                        
                        {canDeleteWorkflows && (
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                {__('common.actions.delete')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {__('workflows.components.triggers')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{workflow.triggers?.length || 0}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {__('workflows.components.conditions')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{workflow.conditions?.length || 0}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {__('workflows.components.actions')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{workflow.actions?.length || 0}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {__('workflows.execution.recent')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{workflow.executions?.length || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Workflow Visual Representation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            {__('workflows.visual.title')}
                        </CardTitle>
                        <CardDescription>
                            {__('workflows.visual.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Triggers Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {__('workflows.components.triggers')} ({workflow.triggers?.length || 0})
                                </h3>
                            </div>
                            
                            {workflow.triggers && workflow.triggers.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {workflow.triggers.map((trigger, index) => (
                                        <Card key={trigger.id} className="border-blue-200 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/30">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    <span className="text-sm font-medium">
                                                        {__('workflows.builder.trigger')} {index + 1}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {__(`workflows.events.${trigger.event}`) || trigger.event}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    {__('workflows.visual.no_triggers')}
                                </p>
                            )}
                        </div>

                        {/* Flow Connector */}
                        {((workflow.triggers?.length || 0) > 0 && (workflow.conditions?.length || 0) > 0) && (
                            <div className="flex justify-center">
                                <ArrowDown className="h-6 w-6 text-muted-foreground" />
                            </div>
                        )}

                        {/* Conditions Section */}
                        {workflow.conditions && workflow.conditions.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                        {__('workflows.components.conditions')} ({workflow.conditions.length})
                                    </h3>
                                </div>
                                
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {workflow.conditions.map((condition, index) => (
                                        <Card key={condition.id} className="border-orange-200 bg-orange-50/50 dark:border-orange-800/50 dark:bg-orange-950/30">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Filter className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                    <span className="text-sm font-medium">
                                                        {__('workflows.builder.condition')} {index + 1}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm">
                                                        <span className="font-medium">{condition.field}</span>
                                                        <span className="mx-1 text-muted-foreground">
                                                            {__(`workflows.operators.${condition.operator}`) || condition.operator}
                                                        </span>
                                                        {condition.value !== null && condition.value !== undefined && (
                                                            <span className="font-medium">
                                                                {typeof condition.value === 'string' ? condition.value : String(condition.value)}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Flow Connector */}
                        {((workflow.conditions?.length || 0) > 0 || (workflow.triggers?.length || 0) > 0) && (workflow.actions?.length || 0) > 0 && (
                            <div className="flex justify-center">
                                <ArrowDown className="h-6 w-6 text-muted-foreground" />
                            </div>
                        )}

                        {/* Actions Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                                    {__('workflows.components.actions')} ({workflow.actions?.length || 0})
                                </h3>
                            </div>
                            
                            {workflow.actions && workflow.actions.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {workflow.actions.map((action, index) => (
                                        <Card key={action.id} className="border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/30">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    <span className="text-sm font-medium">
                                                        {__('workflows.builder.action')} {index + 1}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {__(`workflows.actions_types.${action.action_type}`) || action.action_type}
                                                </p>
                                                {action.parameters && Object.keys(action.parameters).length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800/50">
                                                        <p className="text-xs text-muted-foreground">
                                                            {Object.keys(action.parameters).length} {__('workflows.visual.parameters')}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    {__('workflows.visual.no_actions')}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Executions */}
                {workflow.executions && workflow.executions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{__('workflows.execution.recent')}</CardTitle>
                            <CardDescription>
                                {__('workflows.execution.recent_description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{__('workflows.execution.triggered_by')}</TableHead>
                                        <TableHead>{__('workflows.execution.status.title')}</TableHead>
                                        <TableHead>{__('workflows.execution.started_at')}</TableHead>
                                        <TableHead>{__('workflows.execution.duration')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workflow.executions?.map((execution) => (
                                        <TableRow key={execution.id}>
                                            <TableCell>{execution.triggered_by}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={
                                                        execution.status === 'completed' ? 'default' :
                                                        execution.status === 'failed' ? 'destructive' :
                                                        'secondary'
                                                    }
                                                >
                                                    {__(`workflows.execution.status.${execution.status}`)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(execution.started_at)}</TableCell>
                                            <TableCell>
                                                {execution.duration ? `${execution.duration}ms` : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Workflow Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>{__('workflows.details.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">{__('workflows.fields.name')}</TableCell>
                                    <TableCell>{workflow.name}</TableCell>
                                </TableRow>
                                {workflow.description && (
                                    <TableRow>
                                        <TableCell className="font-medium">{__('workflows.fields.description')}</TableCell>
                                        <TableCell>{workflow.description}</TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell className="font-medium">{__('workflows.fields.status')}</TableCell>
                                    <TableCell>
                                        <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                                            {workflow.is_active ? __('workflows.status.active') : __('workflows.status.inactive')}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{__('common.fields.created_at')}</TableCell>
                                    <TableCell>{formatDate(workflow.created_at)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{__('common.fields.updated_at')}</TableCell>
                                    <TableCell>{formatDate(workflow.updated_at)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                </div>
            </WorkflowsLayout>
        </AppLayout>
    );
} 