import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/utils/translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/form-error';
import { Save } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserResource } from '@/types/resources';

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  locale: string;
  [key: string]: string;
}

export interface UserFormProps {
  user?: Partial<UserResource>;
  submitUrl: string;
  cancelUrl?: string;
  isCreate?: boolean;
  onSuccess?: () => void;
}

export default function UserForm({
  user,
  submitUrl,
  cancelUrl,
  isCreate = !user?.id,
  onSuccess,
}: UserFormProps) {
  const { __ } = useTranslation();

  // Initialize form with default values
  const { data, setData, submit, processing, errors, recentlySuccessful } = useForm<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
    locale: user?.locale || 'fr',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const method = isCreate ? 'post' : 'put';
    
    submit(method, submitUrl, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {__(`users.${isCreate ? 'create' : 'edit'}.form_title`)}
          </CardTitle>
          <CardDescription>
            {isCreate 
              ? __(`users.create.form_description`)
              : __(`users.edit.form_description`, { name: user?.name || '' })}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              {__(`users.fields.name`)} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder={__(`users.placeholders.name`)}
              className="mt-1"
              required
            />
            <FormError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              {__(`users.fields.email`)} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder={__(`users.placeholders.email`)}
              className="mt-1"
              required
            />
            <FormError message={errors.email} />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              {__(`users.fields.password`)} {isCreate && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder={__(`users.placeholders.password`)}
              className="mt-1"
              required={isCreate}
              autoComplete="new-password"
            />
            <FormError message={errors.password} />
          </div>

          <div>
            <Label htmlFor="password_confirmation" className="text-sm font-medium">
              {__(`users.fields.password_confirmation`)} {isCreate && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="password_confirmation"
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              placeholder={__(`users.placeholders.password_confirmation`)}
              className="mt-1"
              required={isCreate}
              autoComplete="new-password"
            />
            <FormError message={errors.password_confirmation} />
          </div>

          <div>
            <Label htmlFor="locale" className="text-sm font-medium">
              {__(`users.fields.locale`)} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.locale}
              onValueChange={(value) => setData('locale', value)}
            >
              <SelectTrigger id="locale" className="mt-1">
                <SelectValue placeholder={__(`users.placeholders.locale`)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <FormError message={errors.locale} />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => cancelUrl ? window.location.href = cancelUrl : window.history.back()}
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
            
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              {isCreate ? __('common.create') : __('common.save')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
} 