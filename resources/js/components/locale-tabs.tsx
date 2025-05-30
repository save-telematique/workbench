import { Locale, useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { useTranslation } from '@/utils/translation';
import { FrenchFlag, UKFlag } from '@/components/icons/flags';

export default function LocaleTabs({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { locale, updateLocale } = useLocale();
    const { __ } = useTranslation();

    const tabs: { value: Locale; icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string }[] = [
        { value: 'en', icon: UKFlag, label: __('common.english') },
        { value: 'fr', icon: FrenchFlag, label: __('common.french') },
    ];

    return (
        <div className={cn('inline-flex gap-1 rounded-lg bg-muted p-1', className)} {...props}>
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateLocale(value)}
                    className={cn(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                        locale === value
                            ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
} 