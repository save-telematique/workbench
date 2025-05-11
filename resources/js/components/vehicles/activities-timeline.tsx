import FormattedDate from '@/components/formatted-date';
import { Badge } from '@/components/ui/badge';
import { ActivityChangeResource, ActivityResource, WorkingSessionResource } from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { format, parseISO } from 'date-fns';
import { Activity } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface ActivitiesTimelineProps {
    data: WorkingSessionResource[] | ActivityChangeResource[];
    type: 'working-sessions' | 'activity-changes';
}

// Get color for an activity based on its name
const getActivityColor = (activity: ActivityResource | undefined): string => {
    if (!activity) {
        return '#d1d5db';
    }

    if (activity.color) {
        return activity.color;
    }

    return '#d1d5db';
};

export function ActivitiesTimeline({ data, type }: ActivitiesTimelineProps) {
    const { __ } = useTranslation();

    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
        const dateA =
            type === 'working-sessions'
                ? new Date((a as WorkingSessionResource).started_at || 0).getTime()
                : new Date((a as ActivityChangeResource).recorded_at || 0).getTime();

        const dateB =
            type === 'working-sessions'
                ? new Date((b as WorkingSessionResource).started_at || 0).getTime()
                : new Date((b as ActivityChangeResource).recorded_at || 0).getTime();

        return dateB - dateA; // Most recent first
    });

    if (!sortedData.length) {
        return <div className="text-muted-foreground flex h-24 items-center justify-center">{__('common.no_data_available')}</div>;
    }

    // Group data by date
    const groupedByDate = sortedData.reduce(
        (acc, item) => {
            const dateStr =
                type === 'working-sessions'
                    ? (item as WorkingSessionResource).started_at?.slice(0, 10) || 'unknown'
                    : (item as ActivityChangeResource).recorded_at?.slice(0, 10) || 'unknown';

            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }

            acc[dateStr].push(item);
            return acc;
        },
        {} as Record<string, Array<WorkingSessionResource | ActivityChangeResource>>,
    );

    // Format time for display
    const formatTime = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        try {
            return format(parseISO(dateStr), 'HH:mm');
        } catch {
            return '';
        }
    };

    // Format duration in a human-readable way
    const formatDuration = (minutes: number | undefined) => {
        if (minutes === undefined) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours === 0) {
            return `${mins}m`;
        }

        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <Card>
            <CardContent>
                <div className="px-4 py-2">
                    {Object.entries(groupedByDate).map(([date, items]) => (
                        <div key={date} className="mb-8 last:mb-0">
                            <div className="mb-4 flex items-center">
                                <div className="bg-muted h-px flex-1"></div>
                                <h3 className="dark:bg-background mx-2 rounded-full bg-white px-3 text-sm font-semibold">
                                    {date !== 'unknown' ? <FormattedDate date={date} format="PPP" /> : __('common.unknown_date')}
                                </h3>
                                <div className="bg-muted h-px flex-1"></div>
                            </div>

                            <div className="space-y-6">
                                {items.map((item, index) => {
                                    const session = item as WorkingSessionResource;
                                    const startTime = formatTime(session.started_at);
                                    const endTime = session.ended_at ? formatTime(session.ended_at) : __('common.ongoing');
                                    const activityColor = getActivityColor(session.activity);

                                    return (
                                        <div key={`session-${session.id}-${index}`} className="flex">
                                            <div className="mr-4 flex flex-col items-center">
                                                <div
                                                    className="flex h-10 w-10 items-center justify-center rounded-full"
                                                    style={{
                                                        backgroundColor: `${activityColor}20`,
                                                        borderColor: activityColor,
                                                        borderWidth: '1.5px',
                                                    }}
                                                >
                                                    <Activity className="h-5 w-5" style={{ color: activityColor }} />
                                                </div>
                                                {index < items.length - 1 && (
                                                    <div className="bg-muted h-full w-px" style={{ minHeight: '40px' }}></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pt-1 pb-4">
                                                <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="font-medium" style={{ color: activityColor }}>
                                                        {session.activity?.name}
                                                    </div>
                                                    <div className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs">
                                                        {startTime} - {endTime}
                                                    </div>
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                                                    {session.duration !== undefined && (
                                                        <Badge variant="secondary">{formatDuration(session.duration)}</Badge>
                                                    )}
                                                    {session.working_day?.driver && (
                                                        <Badge variant="outline" className="bg-primary/5">
                                                            {session.working_day.driver.firstname} {session.working_day.driver.surname}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
