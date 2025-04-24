import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';
import { SharedData } from '@/types';
import { useTranslation } from '@/utils/translation';

export default function AppLogo() {
    const { auth } = usePage<SharedData>().props;
    const { __ } = useTranslation();
    
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">
                    {auth.user.tenant?.name ?? __('common.administration')}</span>
            </div>
        </>
    );
}
