import { FormError } from '@/components/form-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SharedData } from '@/types';
import { GroupResource, TenantResource } from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';

interface GroupFormProps {
    group: Partial<GroupResource>;
    tenants: TenantResource[];
    parentGroups: GroupResource[];
    isCreate?: boolean;
    onSuccess?: () => void;
}

// Define the form data type
interface GroupFormData {
    name: string;
    description: string;
    color: string;
    parent_id: string | null;
    tenant_id: string | null;
    is_active: boolean;
    [key: string]: string | boolean | null;
}

export default function GroupForm({ group, tenants, parentGroups, isCreate = false, onSuccess }: GroupFormProps) {
    const { __ } = useTranslation();
    const { auth } = usePage<SharedData>().props;

    // Initialize form with default values
    const { data, setData, submit, processing, errors, recentlySuccessful } = useForm<GroupFormData>({
        name: group.name || '',
        description: group.description || '',
        color: group.color || '#6366f1',
        parent_id: group.parent_id || null,
        tenant_id: group.tenant_id || auth.user?.tenant_id || null,
        is_active: group.is_active ?? true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isCreate) {
            submit('post', route('groups.store'), {
                onSuccess: () => {
                    onSuccess?.();
                },
            });
        } else {
            submit('put', route('groups.update', { group: group.id }), {
                onSuccess: () => {
                    onSuccess?.();
                },
            });
        }
    }

    function handleParentChange(value: string) {
        setData('parent_id', value === 'null' ? null : value);
    }

    // Filter parent groups by selected tenant
    const filteredParentGroups = parentGroups.filter((parentGroup) => {
        if (!data.tenant_id) return !parentGroup.tenant_id;
        return parentGroup.tenant_id === data.tenant_id;
    });

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{isCreate ? __('groups.create.heading') : __('groups.edit.heading')}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">{__('groups.fields.name')}
                                <span className="text-destructive"> *</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={__('groups.placeholders.name')}
                                required
                            />
                            <FormError message={errors.name} />
                        </div>

                        {/* Color */}
                        <div className="space-y-2">
                            <Label htmlFor="color">{__('groups.fields.color')}</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="h-10 w-20 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    placeholder="#6366f1"
                                    className="flex-1"
                                />
                            </div>
                            <FormError message={errors.color} />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{__('groups.fields.description')}</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder={__('groups.placeholders.description')}
                            rows={3}
                        />
                        <FormError message={errors.description} />
                    </div>

                    {!auth.user?.tenant_id && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="tenant_id" className="text-sm font-medium">
                                    {__('vehicles.fields.tenant')}
                                    <span className="text-destructive"> *</span>
                                </Label>
                                <Select value={data.tenant_id ?? ''} onValueChange={(value) => setData('tenant_id', value === 'none' ? null : value)}>
                                    <SelectTrigger id="tenant_id" className="mt-1">
                                        <SelectValue placeholder={__('vehicles.placeholders.tenant')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenants.map((tenant) => (
                                            <SelectItem key={`tenant-${tenant.id}`} value={tenant.id}>
                                                {tenant.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormError message={errors.tenant_id} />
                            </div>
                        </>
                    )}

                    {/* Parent Group */}
                    <div className="space-y-2">
                        <Label htmlFor="parent">{__('groups.fields.parent_group')}</Label>
                        <Select value={data.parent_id || 'null'} onValueChange={handleParentChange}>
                            <SelectTrigger>
                                <SelectValue placeholder={__('groups.placeholders.parent_group')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">{__('groups.options.no_parent')}</SelectItem>
                                {filteredParentGroups.map((parentGroup) => (
                                    <SelectItem key={parentGroup.id} value={parentGroup.id}>
                                        {parentGroup.full_path || parentGroup.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormError message={errors.parent_id} />
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                        <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                        <Label htmlFor="is_active">{__('groups.fields.is_active')}</Label>
                        <FormError message={errors.is_active} />
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" asChild>
                        <a href={route('groups.index')}>{__('common.cancel')}</a>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-gray-600">{__('common.saved')}</p>
                        </Transition>

                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? __('common.saving') : __('common.save')}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    );
}
