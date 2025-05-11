import FormattedDate from '@/components/formatted-date';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/utils/translation';
import { Card, CardContent } from '@/components/ui/card';
import { DriverResource } from '@/types/resources';

interface DriverCardProps {
    driver: DriverResource;
    className?: string;
}

// Composant pour le drapeau européen
const EUFlag = ({ countryCode }: { countryCode: string | null }) => (
    <div className="relative flex overflow-hidden h-15 w-full items-center justify-center rounded-sm border border-slate-300 bg-[#034ea2]">
        <div className="absolute inset-0">
            <svg className="overflow-hidden" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="22" fill="#034ea2" />
                <g fill="#FFD700">
                    {/* 12 étoiles en cercle */}
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
        <div className="z-10 mt-2 text-lg font-bold text-white">{countryCode}</div>
    </div>
);

export function DriverCard({
    driver,
    className,
}: DriverCardProps) {
    const { __ } = useTranslation();
    const countryCode = driver.card_issuing_country;

    return (
        <Card className={cn('relative max-w-md py-4 select-none', className)}>
            <CardContent className={cn('px-4')}>
                <div className="pointer-events-none absolute inset-0 opacity-5">
                    <div
                        className="h-full w-full bg-repeat"
                        style={{
                            backgroundImage:
                                "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMjUsMjVIMzBMMjAsNDVIMTVMMjUsMjVaIE0yNSwyNUgyMEwzMCw1SDM1TDI1LDI1WiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')",
                        }}
                    ></div>
                </div>

                <div className="relative flex">
                    {/* Background pattern (subtle) */}

                    {/* Colonne gauche avec le drapeau, titre et photo */}
                    <div className="mr-4 flex w-24 flex-shrink-0 flex-col space-y-2">
                        {/* Drapeau EU */}
                        <EUFlag countryCode={countryCode} />

                        {/* Photo */}
                        <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden border border-slate-300 bg-gray-50">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-12 w-12 text-slate-400"
                            >
                                <circle cx="12" cy="8" r="5"></circle>
                                <path d="M20 21v-2a7 7 0 0 0-14 0v2"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Colonne centrale avec le titre et les informations */}
                    <div className="flex flex-grow flex-col">
                        {/* En-tête avec le titre */}
                        <div className="mb-2 flex flex-col">
                            <div className="text-sm font-bold text-[#034ea2] uppercase">{__('drivers.card.title')}</div>
                        </div>

                        {/* Informations en grille */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {/* Colonne gauche */}
                            <div className="space-y-1.5">
                                <div>
                                    <div className="text-xs font-semibold">{__('drivers.card.surname')}:</div>
                                    <div className="text-sm font-semibold uppercase">{driver.surname}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold">{__('drivers.card.firstname')}:</div>
                                    <div className="text-sm">{driver.firstname}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold">{__('drivers.card.birthdate')}:</div>
                                    <div className="text-sm">
                                        {driver.birthdate ? (
                                            <>
                                                <FormattedDate date={driver.birthdate} format="DATE_MED" />
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Colonne droite */}
                            <div className="space-y-1.5">
                                <div>
                                    <div className="text-xs font-semibold">{__('drivers.card.issuing_date')}:</div>
                                    <div className="text-sm">
                                        {driver.card_issuing_date ? (
                                            <>
                                                <FormattedDate date={driver.card_issuing_date} format="DATE_MED" />
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold">{__('drivers.card.expiration_date')}:</div>
                                    <div className="text-sm">
                                        {driver.card_expiration_date ? (
                                            <>
                                                <FormattedDate date={driver.card_expiration_date} format="DATE_MED" />
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold">{__('drivers.card.license_number')}:</div>
                                    <div className="text-sm">{driver.license_number || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold">{__('drivers.card.card_number')}:</div>
                                    <div className="text-sm">{driver.card_number || '-'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
