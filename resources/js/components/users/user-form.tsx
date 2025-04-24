import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/utils/translation';

interface User {
    id?: string;
    name?: string;
    email?: string;
    locale?: string;
}

interface UserFormProps {
    user?: User;
    translationNamespace: 'users' | 'tenant_users';
    submitUrl: string;
    cancelUrl: string;
}

export default function UserForm({ user, translationNamespace, submitUrl, cancelUrl }: UserFormProps) {
    const { __ } = useTranslation();
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        locale: user?.locale || 'fr',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (user?.id) {
            put(submitUrl);
        } else {
            post(submitUrl);
        }
    };

    return (
        <form onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>{__(`${translationNamespace}.${user ? 'edit' : 'create'}.form_title`)}</CardTitle>
                    <CardDescription>
                        {user && user.name
                            ? __(`${translationNamespace}.edit.form_description`, { name: user.name })
                            : __(`${translationNamespace}.create.form_description`)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{__(`${translationNamespace}.fields.name`)}</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">{__(`${translationNamespace}.fields.email`)}</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{__(`${translationNamespace}.fields.password`)}</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            {__(`${translationNamespace}.fields.password_confirmation`)}
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="locale">{__(`${translationNamespace}.fields.locale`)}</Label>
                        <Select value={data.locale} onValueChange={(value) => setData('locale', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={__(`${translationNamespace}.fields.locale`)} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.locale && <p className="text-sm text-red-500">{errors.locale}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button" onClick={() => window.location.href = cancelUrl}>
                        {__('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {__(`${translationNamespace}.actions.${user ? 'save' : 'create'}`)}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
} 