import { cn } from '@/lib/utils';
import { useTranslation } from '@/utils/translation';
import { Card, CardContent } from '@/components/ui/card';
import { DriverResource } from '@/types/resources';

interface DriverCompactCardProps {
    driver: DriverResource;
    className?: string;
}

// Compact EU Flag
const CompactEUFlag = ({ countryCode }: { countryCode: string | null }) => (
    <div className="relative flex overflow-hidden h-6 w-10 items-center justify-center rounded-sm border border-slate-300 bg-[#034ea2]">
        <div className="absolute inset-0">
            <svg className="overflow-hidden" viewBox="0 0 36 22" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="22" fill="#034ea2" />
                <g fill="#FFD700">
                    {[...Array(12)].map((_, i) => {
                        const angle = (i * 30 * Math.PI) / 180;
                        const cx = 18 + 8 * Math.sin(angle);
                        const cy = 11 - 8 * Math.cos(angle);
                        return (
                            <path
                                key={i}
                                d="M 0,-1.5 L 0.45,0.15 L 1.9,0.15 L 0.75,0.6 L 1.1,1.9 L 0,1.1 L -1.1,1.9 L -0.75,0.6 L -1.9,0.15 L -0.45,0.15 Z"
                                transform={`translate(${cx}, ${cy})`}
                            />
                        );
                    })}
                </g>
            </svg>
        </div>
        <div className="z-10 text-xs font-bold text-white">{countryCode}</div>
    </div>
);

export function DriverCompactCard({
    driver,
    className,
}: DriverCompactCardProps) {
    const { __ } = useTranslation();

    return (
        <Card className={cn('relative w-full py-2', className)}>
            <CardContent className={cn('px-2 py-0')}>
                <div className="pointer-events-none absolute inset-0 opacity-5">
                    <div
                        className="h-full w-full bg-repeat"
                        style={{
                            backgroundImage:
                                "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMjUsMjVIMzBMMjAsNDVIMTVMMjUsMjVaIE0yNSwyNUgyMEwzMCw1SDM1TDI1LDI1WiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')",
                        }}
                    ></div>
                </div>

                <div className="relative flex flex-col items-center space-y-2">
                    {/* Header with flag and title */}
                    <div className="flex w-full gap-2 items-center justify-between">
                        <CompactEUFlag countryCode={driver.card_issuing_country} />
                        <div className="text-xs font-bold text-[#034ea2] uppercase">{__('drivers.card.title')}</div>
                    </div>
                    
                    {/* Photo */}
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-gray-50">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8 text-slate-400"
                        >
                            <circle cx="12" cy="8" r="5"></circle>
                            <path d="M20 21v-2a7 7 0 0 0-14 0v2"></path>
                        </svg>
                    </div>
                    
                    {/* Driver name */}
                    <div className="text-center">
                        <div className="text-xs font-semibold uppercase">{driver.surname}</div>
                        <div className="text-xs">{driver.firstname}</div>
                    </div>
                    
                    {/* Essential info */}
                    <div className="w-full space-y-1">
                        <div>
                            <div className="text-xs font-semibold">{__('drivers.card.card_number')}:</div>
                            <div className="truncate text-xs">{driver.card_number || '-'}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 